using System;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;
using System.Threading;
using ICSharpCode.SharpZipLib.Zip;
using NLog;
using Server.Common;

namespace Server.Modules.Branches
{
    public class BranchManager
  {
    private static Logger log = LogManager.GetLogger("BranchManager");

    private static Thread _uploadThread = new Thread(UploadhreadProc);
    private static ManualResetEvent _uploadEvent = new ManualResetEvent(false);

    private static Thread _modelThread = new Thread(ModelThreadProc);
    private static BlockingCollection<string> _uploadedBranches = new BlockingCollection<string>();
    
    private static ConcurrentDictionary<string, Branch> _model = new ConcurrentDictionary<string, Branch>();
    private static int _revision;

    static BranchManager()
    {
      Initialize();
      
      _uploadThread.Start();
      _modelThread.Start();
    }

    public static void Initialize()
    {
      // ReadModel();
      // ReadRevision();
    }

    private static void ReadModel()
    {
      // skip branches without revision!!!!
      var dirs = Directory.GetDirectories(AppPaths.Branches);
      foreach (var dir in dirs) {
        var branch = new Branch { Name = dir, BuildNum = 123, Uploaded = DateTime.UtcNow };
        _model[branch.Name] = branch;
      }
    }

    private static void ModelThreadProc()
    {
      while (true) {
        var branchName = _uploadedBranches.Take();
        var branchDir = Path.Combine(AppPaths.Branches, branchName);
        if (Directory.Exists(branchDir)) {
          var branch = new Branch {
            Name = branchName,
            Uploaded = Directory.GetLastWriteTimeUtc(branchDir)
          };
        }
      }
    }

    public static void PackageUploaded()
    {
      _uploadEvent.Set();
    }

    private static async void UploadhreadProc()
    {
      var uploadDir = new DirectoryInfo(AppPaths.Uploads);

      while (true)
      {
        _uploadEvent.WaitOne(5000);

        var packageFile = (
          from f in uploadDir.GetFiles("*.zip")
          orderby System.IO.File.GetLastWriteTimeUtc(f.FullName)
          select f
        ).FirstOrDefault();

        if (packageFile == null) {
          _uploadEvent.Reset();
          continue;
        }

        var packageInfo = new PackageInfo(packageFile.FullName);
        log.Info($"Unpack branch '{packageInfo.Branch}' from package '{packageFile.Name}'.");

        using (var stream = System.IO.File.Open(packageFile.FullName, FileMode.Open, FileAccess.Read))
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
                await zipStream.CopyToAsync(fileStream);
          }
        }

        WriteRevision(Path.GetFileName(Path.Combine(AppPaths.Branches, packageInfo.Branch)), ++_revision);
        System.IO.File.Delete(packageFile.FullName);

        _uploadedBranches.Add(packageInfo.Branch);

        log.Info($"Delete package {packageFile.Name}.");
      }
    }
    
    private static void ReadRevision()
    {
      foreach (var branchPath in Directory.GetDirectories(AppPaths.Branches))
        _revision = Math.Max(_revision, ReadRevision(Path.GetFileName(branchPath)));
    }

    private static int ReadRevision(string branchName)
    {
      var revPath = Path.Combine(AppPaths.Branches, branchName, ".rev");
      using (var reader = new StreamReader(revPath))
        return int.Parse(reader.ReadLine());
    }

    private static void WriteRevision(string branchName, int revision)
    {
      var revPath = Path.Combine(AppPaths.Branches, branchName, ".rev");
      using (var stream = new FileStream(revPath, FileMode.OpenOrCreate, FileAccess.Write))
      using (var writer = new StreamWriter(stream))
        writer.WriteLine(revision);
    }
  }
}