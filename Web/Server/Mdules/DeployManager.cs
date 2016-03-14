using System;
using System.Collections.Concurrent;
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
    public bool DeploySpecs;
    public long BuildNum;
    public int Revision;
    public bool IsDeleted;
    public List<Package> Packages;
    public Package DeployingPackage;
    public BranchState State;
    
    public Branch()
    {
      Packages = new List<Package>();
    }
    
    public Branch Clone()
    {	
      return (Branch) MemberwiseClone();
    }
  }

  public enum BranchState
  {
    
  }

  public class Package
  {
    public string BranchName;
    public DateTime UploadTimeUtc;
    public string FileName;
    public string FullName;
    public PackageState State;

    public static Package FromFile(FileInfo file)
    {
      var ext = Path.GetExtension(file.Name);
      var tokens = file.Name.Split(new[] {"#"}, StringSplitOptions.RemoveEmptyEntries);
      return new Package {
        BranchName = tokens[0],
        UploadTimeUtc = new DateTime(Convert.ToInt64(tokens[1])),
        FileName = file.Name,
        FullName = file.FullName,
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
    private static AutoResetEvent _mainEvent = new AutoResetEvent(false);

    private static object _locker = new object();
    private static List<Branch> _branches = new List<Branch>();

    private static long DeployThreadsCount = 5;

    private static bool _initialized;

    public static void Initialize()
    {
      if (_initialized)
        Exceptions.ServerError("Deployment manager already initialized.");

      ReadBranches();
      ProcessUploads();

      _mainEvent.Set();
      _mainThread.Start();

      _initialized = true;
    }

    private static void ReadBranches()
    {
      var branchesDir = new DirectoryInfo(AppPaths.Branches);
      foreach (var dir in branchesDir.GetDirectories()) {
        var branch = LoadBranch(dir);
        if (branch != null)
          _branches.Add(branch);
      }
    }

    private static void ProcessUploads()
    {
      var extensions = new[] {".zip", ".tmp"};
      var packagesToDelete = new List<Package>();

      var uploadDir = new DirectoryInfo(AppPaths.Uploads);
      var packagesByBranch = _branches.ToDictionary(b => b.Name, b => b.Packages);
      foreach (var file in uploadDir.EnumerateFiles().Where(file => extensions.Contains(file.Extension.ToLower()))) {
        var package = Package.FromFile(file);
        if (!packagesByBranch.ContainsKey(package.BranchName) || 
             packagesByBranch[package.BranchName].All(p => p.UploadTimeUtc != package.UploadTimeUtc))
          packagesToDelete.Add(package);
      }

      foreach (var package in packagesToDelete) {
        log.Info($"Delete unreferenced package {package.FileName}, upoaded at {package.UploadTimeUtc}");
        File.Delete(package.FullName);
      }
    }

    private static Branch LoadBranch(DirectoryInfo dir)
    {
      var jsonFile = Path.Combine(dir.FullName, ".data.json");
      var tmpFile = Path.ChangeExtension(jsonFile, "tmp");
      var oldFile = Path.ChangeExtension(jsonFile, "old");

      if (File.Exists(oldFile)) {
        if (File.Exists(jsonFile))
          File.Delete(jsonFile);
        File.Move(oldFile, jsonFile);
      }

      if (File.Exists(tmpFile))
        File.Delete(tmpFile);

      if (!File.Exists(jsonFile))
        return null;

      using (var stream = File.Open(jsonFile, FileMode.Open, FileAccess.Read, FileShare.Read))
      using (var reader = new StreamReader(stream)) {
        var serializer = new JsonSerializer();
        return (Branch) serializer.Deserialize(reader, typeof(Branch)); 
      }
    }

    public static void SaveBranch(Branch branch)
    {
      var dirPath = Path.Combine(AppPaths.Branches, branch.Name);
      if (!Directory.Exists(dirPath))
        Directory.CreateDirectory(dirPath);

      var jsonFile = Path.Combine(dirPath, ".data.json");
      var tmpFile = Path.ChangeExtension(jsonFile, "tmp");
      var oldFile = Path.ChangeExtension(jsonFile, "old");

      // restore in case of previous failed state
      if (File.Exists(oldFile)) {
        if (File.Exists(jsonFile))
          File.Delete(jsonFile);
        File.Move(oldFile, jsonFile);
      }

      if (File.Exists(tmpFile))
        File.Delete(tmpFile);

      // write to tmp file
      using (var stream = File.Open(tmpFile, FileMode.Create, FileAccess.Write, FileShare.Write))
      using (var writer = new StreamWriter(stream)) {
        var serializer = new JsonSerializer();
        serializer.Serialize(writer, branch); 
      }

      // rename .json -> .old
      if (File.Exists(jsonFile))
        File.Move(jsonFile, oldFile);

      // rename .tmp -> .json
      File.Move(tmpFile, jsonFile);
      
      // remove .old
      if (File.Exists(oldFile))
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

        var isNewBranch = false;
        if (branch == null) {
          isNewBranch = true;
          branch = new Branch {Name = package.BranchName};
          _branches.Add(branch);
        }

        branch.Packages.Add(package);

        try
        {
          SaveBranch(branch);
          log.Info($"Package {package.FileName} added to branch {branch.Name} queue");
        }
        catch (Exception ex)
        {
          if (isNewBranch)
            _branches.Remove(branch);
          else
            branch.Packages.Remove(package);

          File.Delete(package.FullName);

          log.Error(ex, $"Error save branch {branch.Name}");
          throw;
        }
      }

      _mainEvent.Set();
    }

    private static void MainThreadProc()
    {
      //TODO trycatch
      while (_mainEvent.WaitOne()) {
        lock (_locker) {

          // find next to deploy branch
          Branch branchToDeploy = null;
          foreach (var branch in _branches) {
            if (!branch.DeploySpecs
              || branch.Packages.Count == 0
              || branch.Packages[0].State == PackageState.Deploying)
              continue;

            if (branchToDeploy == null || branch.Packages[0].UploadTimeUtc < branchToDeploy.Packages[0].UploadTimeUtc)
              branchToDeploy = branch;
          }
          
          if (branchToDeploy != null && Interlocked.Read(ref DeployThreadsCount) > 0) {
            branchToDeploy.Packages[0].State = PackageState.Deploying;
            Interlocked.Decrement(ref DeployThreadsCount);
            ThreadPool.QueueUserWorkItem(_ => Deploy(branchToDeploy));
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
    
    private static void Deploy(Branch branch)
    {
      log.Info($"Deploying branch {branch.Name}");
      
      Package package = null;
      try
      {
        Thread.Sleep(3000); // DO DEPLOY
        lock (_locker) {
          package = branch.Packages[0];
          branch.Packages.RemoveAt(0);
          SaveBranch(branch);
        }
        try {
          File.Delete(package.FullName);
        }
        catch (Exception ex) {
          log.Warn(ex, $"Error deleting package file {package.FileName}. File will be deleted on later.");
        }
      }
      catch (Exception ex)
      {
        log.Error(ex, $"Error deploying package {package.FileName} of branch {branch.Name}");
        lock (_locker) {
          if (package != null) {
            package.State = PackageState.Pending;
            branch.Packages.Insert(0, package);
          }
          else {
            branch.Packages[0].State = PackageState.Pending;
          }
          //TODO mark branch as postponed
        }
      }
      Interlocked.Increment(ref DeployThreadsCount);
      _mainEvent.Set();
    }
  }
}