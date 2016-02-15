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
    private static Logger log = LogManager.GetLogger("PackageManager");

    private static Thread _thread = new Thread(ThreadProc);
    private static ManualResetEvent _event = new ManualResetEvent(false);

    static BranchManager()
    {
      _thread.Start();
    }

    public static void PackageUploaded()
    {
      _event.Set();
    }

    private static async void ThreadProc()
    {
      var uploadDir = new DirectoryInfo(AppPaths.Uploads);
      
      while (_event.WaitOne())
      {
        var file = (
          from f in uploadDir.GetFiles("*.zip")
          orderby System.IO.File.GetLastWriteTimeUtc(f.FullName)
          select f
        ).FirstOrDefault();

        if (file == null) {
          _event.Reset();
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
        
        System.IO.File.Delete(file.FullName);
        log.Info($"Delete package {file.Name}");
      }
    }
  }
}