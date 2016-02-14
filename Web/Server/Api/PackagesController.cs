using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using ICSharpCode.SharpZipLib.Zip;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Net.Http.Headers;
using NLog;
using Server.Common;
using Server.Common.Entities;

namespace Server.Api.Uploads
{
  [Route("api/packages")]
  public class PackagesController : Controller
  {
    private static Logger log = LogManager.GetLogger("Packages");
    
    private static Thread _thread = new Thread(ThreadProc);
    private static AutoResetEvent _event = new AutoResetEvent(false);

    static PackagesController()
    {
      _thread.Start();
    }

    private static async void ThreadProc()
    {
      var uploadDir = new DirectoryInfo(AppPaths.Uploads);
      
      while(true) {
        _event.WaitOne();

        var package = (
          from file in uploadDir.GetFiles("*.zip")
          let ticks = Convert.ToInt64(Path.GetFileNameWithoutExtension(file.Name))
          let time = new DateTime(ticks)
          orderby time
          select file
        ).FirstOrDefault();

        if (package != null)
        {
          using (var stream = System.IO.File.Open(package.FullName, FileMode.Open, FileAccess.Read))
          using (var zipStream = new ZipInputStream(stream))
          {
            var topDir1 = true;
            ZipEntry entry;
            while ((entry = zipStream.GetNextEntry()) != null)
            {
              if (entry.IsDirectory)
              {
                Directory.CreateDirectory(Path.Combine(AppPaths.Branches, entry.Name));
                if (topDir1) {
                  log.Info($"Copy branch {entry.Name} from packages {package.Name}");
                  topDir1 = false;
                }
              }
              else
              {
                using (var fileStream = System.IO.File.Create(Path.Combine(AppPaths.Branches, entry.Name)))
                {
                  await zipStream.CopyToAsync(fileStream);
                }
              }
            }
          }
          
          System.IO.File.Delete(package.FullName);
          log.Info($"Delete package {package.Name}");
        }
      }
    }
    
    [HttpPost]
    public async Task Upload(IFormFile package)
    {
      if (package != null && package.Length != 0)
      {
        var fileName = DateTime.UtcNow.Ticks.ToString();
        var filePath = AppPaths.Uploads + "/" + fileName;
        await package.SaveAsAsync(filePath + ".tmp");
        System.IO.File.Move($"{filePath}.tmp", $"{filePath}.zip");
        _event.Set();
        log.Info($"Uploaded package {fileName}.zip");
      }
    }
  }
}