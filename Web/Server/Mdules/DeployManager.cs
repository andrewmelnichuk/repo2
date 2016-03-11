using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using NLog;
using Server.Common;

namespace Server.Modules
{
    public class Branch
  {
    public string Name;
    public long BuildNum;
    public int Revision;
    public bool IsDeleted;
    public List<Package> DeployQueue;
    
    public Branch()
    {
      DeployQueue = new List<Package>();
    }
    
    public Branch Clone()
    {	
      return (Branch) MemberwiseClone();
    }
  }

  public class Package
  {
    public string BranchName;
    public DateTime UploadTimeUtc;
    public string FileName;
    public PackageState State;

    public static Package FromFile(FileInfo file)
    {
      var ext = Path.GetExtension(file.Name);
      var tokens = file.Name.Split(new[] {"#"}, StringSplitOptions.RemoveEmptyEntries);
      return new Package {
        BranchName = tokens[0],
        UploadTimeUtc = new DateTime(Convert.ToInt64(tokens[1])),
        FileName = file.Name,
        State = PackageState.Pending 
      };
    }
  }

  public enum PackageState
  {
    Pending,
    Deploying
  }

  public class DeployManager
  {
    private static Logger log = LogManager.GetLogger("DeployManager");

    private static Thread _mainThread = new Thread(MainThreadProc);
    private static ManualResetEvent _packageEvent = new ManualResetEvent(false);

    private static object _locker = new object();
    private static List<Branch> _branches = new List<Branch>();

    private static long DeployThreadsCount = 5;

    private static bool _initialized;

    public static void Initialize()
    {
      if (_initialized)
        Exceptions.ServerError("Deployment manager already initialized.");

      ReadBranches();

      _packageEvent.Set();
      _mainThread.Start();

      _initialized = true;
    }

    private static void ReadBranches()
    {
      var branchesDir = new DirectoryInfo(AppPaths.Branches);
      foreach (var dir in branchesDir.GetDirectories()) {
        var branch = ReadBranch(dir);
        if (branch != null) {
          _branches.Add(branch);
        }
        else {
          log.Warn($"Found empty branch dir {dir}.");
          // TODO restore branch from upload queue
          continue;
        }
      }
    }

    private static Branch ReadBranch(DirectoryInfo dir)
    {
      var jsonFile = Path.Combine(dir.FullName, ".branch.json");
      var tmpFile = Path.ChangeExtension(jsonFile, "tmp");
      var oldFile = Path.ChangeExtension(jsonFile, "old");

      if (!File.Exists(jsonFile)) {
        if (File.Exists(tmpFile))
          File.Delete(tmpFile);
        return null;
      }
      else if (File.Exists(tmpFile) && File.Exists(jsonFile)) { // write was not completed
        File.Delete(tmpFile);
      }
      else if (File.Exists(tmpFile) && File.Exists(oldFile)) { // write completed but not committed
        File.Move(tmpFile, jsonFile);
        File.Delete(oldFile);
      }
      else if (File.Exists(jsonFile) && File.Exists(oldFile)) { // write completed and committed
        File.Delete(oldFile);
      }

      using (var stream = File.Open(jsonFile, FileMode.Open, FileAccess.Read, FileShare.Read))
      using (var reader = new StreamReader(stream)) {
        var serializer = new JsonSerializer();
        return (Branch) serializer.Deserialize(reader, typeof(Branch)); 
      }
    }

    public static void WriteBranch(Branch branch)
    {
      var dirPath = Path.Combine(AppPaths.Branches, branch.Name);
      if (!Directory.Exists(dirPath))
        Directory.CreateDirectory(dirPath);

      var jsonFile = Path.Combine(dirPath, ".branch.json");
      var tmpFile = Path.ChangeExtension(jsonFile, "tmp");
      var oldFile = Path.ChangeExtension(jsonFile, "old");

      // write to tmp file
      using (var stream = File.Open(tmpFile, FileMode.Create, FileAccess.Write, FileShare.Write))
      using (var writer = new StreamWriter(stream)) {
        var serializer = new JsonSerializer();
        serializer.Serialize(writer, branch); 
      }

      // rename .json -> .old
      File.Move(jsonFile, oldFile);

      // rename .tmp -> .json
      File.Move(tmpFile, jsonFile);
      
      // remove .old
      File.Delete(oldFile);  
    }

    public static async Task Upload(Stream inStream, string fileName)
    {
      var packageName = $"{fileName}#{DateTime.UtcNow.Ticks}";
      var packagePath = Path.Combine(AppPaths.Uploads, packageName);

      using (var outStream = new FileStream($"{packagePath}.tmp", FileMode.Create, FileAccess.Write))
        await inStream.CopyToAsync(outStream);

      System.IO.File.Move($"{packagePath}.tmp", $"{packagePath}.zip");

      var package = Package.FromFile(new FileInfo($"{packagePath}.zip"));
      
      lock (_locker) {
        var branch = _branches.SingleOrDefault(b => string.Compare(b.Name, package.BranchName, true) == 0);

        var isNewBranch= false; 
        if (branch == null) {
          isNewBranch = true;
          branch = new Branch { Name = package.BranchName };
        }

        branch.DeployQueue.Add(package);

        try
        {
          WriteBranch(branch);
          if (isNewBranch)
            _branches.Add(branch);
          log.Info($"Package uploaded at {package.UploadTimeUtc} added to branch {branch.Name} deploy queue");
        }
        catch (Exception ex)
        {
          branch.DeployQueue.Remove(package);
          log.Error(ex, $"Error writing branch {branch.Name}");
          throw;
        }
      }

      _packageEvent.Set();
    }

    private static void MainThreadProc()
    {
      while (true)
      {
        _packageEvent.WaitOne();

        var uqPackages = new HashSet<string>();
        var oldPackages = new List<Package>();

        lock (_locker) {
          for (var i = _packages.Count - 1; i >= 0; i--) {
            var package = _packages[i];
            if (!uqPackages.Contains(package.BranchName))
              uqPackages.Add(package.BranchName);
            else if (package.State == PackageState.Pending)
              oldPackages.Add(package);
              _packages.RemoveAt(i);
          }
        }

        foreach (var package in oldPackages) {
          File.Delete(Path.Combine(AppPaths.Uploads, package.FileName));
          log.Info($"Remove expired package {package.BranchName}, uploaded at {package.UploadTimeUtc}");
        }

        lock (_locker) {
          for (var i = 0; i < _packages.Count && Interlocked.Read(ref DeployThreadsCount) > 0; i++) {
            if (_packages[i].State == PackageState.Pending) {
              _packages[i].State = PackageState.Deploying; 
              Interlocked.Decrement(ref DeployThreadsCount);
              ThreadPool.QueueUserWorkItem(_ => DeployPackage(_packages[i]));
            }
          }
        }
/*
        var packageInfo = new PackageInfo(package.FullName);
        using (var cx = BranchManager.Edit(packageInfo.Branch))
        {
          if (cx.Branch == null || !cx.Branch.IsDeleted)
          {
            log.Info($"Unpack branch '{packageInfo.Branch}' from package '{package.Name}'.");
            using (var stream = System.IO.File.Open(package.FullName, FileMode.Open, FileAccess.Read))
            using (var zipStream = new ZipInputStream(stream))
            {
              ZipEntry entry;
              while ((entry = zipStream.GetNextEntry()) != null)
              {
                var entryPath = Path.Combine(AppPaths.Branches, entry.Name);
                if (entry.IsDirectory)
                  Directory.CreateDirectory(entryPath);
                else
                  using (var fileStream = System.IO.File.Create(entryPath))
                    zipStream.CopyTo(fileStream);
              }
            }
          }
          else {
            log.Info("Branch '{cx.Branch.Name}' was deleted.");
          }

          System.IO.File.Delete(package.FullName);
          log.Info($"Delete package {package.Name}.");

          cx.Complete();
        }
        */
      }
    }
    
    private static void DeployPackage(Package package)
    {
      log.Info($"Deploying package {package.BranchName}.");
      
      // File.Move(Path.Combine(AppPaths.Uploads, package.FileName), Path.Combine(AppPaths.Uploads, package.))
    }
  }
}