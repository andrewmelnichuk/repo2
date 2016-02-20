using System.IO;
using System.Linq;
using System.Threading;
using ICSharpCode.SharpZipLib.Zip;
using NLog;
using Server.Common;

namespace Server.Modules.Branches
{
    public class UploadManager
  {
    private static Logger log = LogManager.GetLogger("UploadManager");

    private static Thread _uploadThread = new Thread(UploadThreadProc);
    private static ManualResetEvent _uploadEvent = new ManualResetEvent(false);

    static UploadManager()
    {
      Initialize();
      _uploadThread.Start();
    }

    public static void Initialize()
    {
    }

    public static void PackageUploaded()
    {
      _uploadEvent.Set();
    }

    private static void UploadThreadProc()
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
        using (var cx = BranchManager.Edit(packageInfo.Branch))
        {
          if (cx.Branch == null || !cx.Branch.IsDeleted)
          {
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
                    zipStream.CopyTo(fileStream);
              }
            }
          }
          else {
            log.Info("Branch '{cx.Branch.Name}' was deleted.");
          }

          System.IO.File.Delete(packageFile.FullName);
          log.Info($"Delete package {packageFile.Name}.");

          cx.Complete();
        }
      }
    }
  }
}