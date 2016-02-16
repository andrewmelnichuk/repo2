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
    private static Logger log = LogManager.GetLogger("PackageManager");

    private static Thread _uploadThread = new Thread(UploadhreadProc);
    private static ManualResetEvent _uploadEvent = new ManualResetEvent(false);

    private static Thread _branchesThread = new Thread(BranchesThreadProc);
    private static BlockingCollection<string> _uploadedBranches = new BlockingCollection<string>();

    static BranchManager()
    {
      Initialize();
      _uploadThread.Start();
      _branchesThread.Start();
    }

    private static void Initialize()
    {
      
    }

    private static void BranchesThreadProc()
    {
      while (true) {
        var branchName = _uploadedBranches.Take();
        var branchDir = Path.Combine(AppPaths.Branches, branchName);
        if (Directory.Exists(branchDir)) {
          var branch = new Branch{
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
        
        _uploadedBranches.Add(packageInfo.Branch);
        System.IO.File.Delete(file.FullName);
        log.Info($"Delete package {file.Name}");
      }
    }
  }
}