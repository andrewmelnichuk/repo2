using System;
using System.Collections.Concurrent;
using System.IO;
using System.Linq;
using System.Threading;
using ICSharpCode.SharpZipLib.Zip;
using NLog;
using Server.Common;
using Server.Common.Entities;

namespace Server.Modules.Branches
{
  public class BranchRepository : EntityRepository<string, Branch>
  {}
  
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

    private static void Initialize()
    {
      ReadModel();
      ReadRevision();
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

    private static void ReadRevision()
    {
      foreach (var branchPath in Directory.GetDirectories(AppPaths.Branches))
        _revision = Math.Max(_revision, ReadRevision(Path.Combine(branchPath, ".rev")));
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
         	BranchRepository.AddOrUpdate(branch.Name, branch); 
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

      while (_uploadEvent.WaitOne())
      {
        var file = (
          from f in uploadDir.GetFiles("*.zip")
          orderby System.IO.File.GetLastWriteTimeUtc(f.FullName)
          select f
        ).FirstOrDefault();

        if (file == null) {
          _uploadEvent.Reset();
          continue;
        }

        var packageInfo = new PackageInfo(file.FullName);
        log.Info($"Copy branch {packageInfo.Branch} from package {file.Name}");

        using (var stream = System.IO.File.Open(file.FullName, FileMode.Open, FileAccess.Read))
        using (var zipStream = new ZipInputStream(stream))
        {
          ZipEntry entry;
          while ((entry = zipStream.GetNextEntry()) != null)
          {
            if (entry.IsDirectory)
              Directory.CreateDirectory(Path.Combine(AppPaths.Branches, entry.Name));
            else
              using (var fileStream = System.IO.File.Create(Path.Combine(AppPaths.Branches, entry.Name)))
                await zipStream.CopyToAsync(fileStream);
          }
        }

        WriteRevision(packageInfo.Branch, ++_revision);

        _uploadedBranches.Add(packageInfo.Branch);
        System.IO.File.Delete(file.FullName);
        log.Info($"Delete package {file.Name}");
      }
    }
    
    private static void WriteRevision(string branchName, int revision)
    {
      var revPath = Path.Combine(AppPaths.Branches, branchName, ".rev");
      using (var stream = new FileStream(branchName, FileMode.OpenOrCreate, FileAccess.Write))
      using (var writer = new StreamWriter(stream))
        writer.WriteLine(_revision);
    }
    
    private static int ReadRevision(string branchName)
    {
      var revPath = Path.Combine(AppPaths.Branches, branchName, ".rev");

      if (!Directory.Exists(revPath))
        Exceptions.ServerError($"Revision file '{revPath}' not found.");

      using (var reader = new StreamReader(revPath)) {
        var revStr = reader.ReadLine();
        int rev = 0;
        int.TryParse(revStr, out rev);
        return rev;
      }
    }
  }
}