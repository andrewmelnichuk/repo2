using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using ICSharpCode.SharpZipLib.Zip;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Net.Http.Headers;
using NLog;
using Server.Common.Entities;

namespace Server.Api.Uploads
{
  [Route("uploads")]
  public class UploadsController : Controller
  {
    private static Logger log = LogManager.GetLogger("uploads");
    
    private static Thread _thread = new Thread(ThreadProc);

    static UploadsController()
    {
      // _thread.Start();
    }

    private static void ThreadProc()
    {
      while(true) {
        log.Info("deploy check");
        Thread.Sleep(1000);
      }
    }
    
    [HttpGet("index")]
    public IActionResult Index()
    {
      return View();
    }
    
    [HttpPost("upload")]
    public async Task<string> Upload(string json, IFormFile package)
    {
      var uploadPath = Environment.CurrentDirectory + "/Uploads";

      if (!Directory.Exists(uploadPath))
        Directory.CreateDirectory(uploadPath);

      log.Info(json);
      log.Info(package.Length);

      using (var zipStream = new ZipInputStream(package.OpenReadStream()))
      {
        ZipEntry zipEntry;
        while ((zipEntry = zipStream.GetNextEntry()) != null)
        {
          Console.WriteLine(zipEntry.Name);
          // var dirPath = Path.GetDirectoryName(zipEntry.Name) ?? "";
          // if (dirPath.Length > 0)
          //   Directory.CreateDirectory(Path.Combine(packagePath, dirPath));

          // using (var fileStream = File.OpenWrite(Path.Combine(packagePath, zipEntry.Name)))
          // {
          //   await zipStream.CopyToAsync(fileStream);
          //   bytesRead += zipEntry.CompressedSize;
          //   Console.WriteLine(zipEntry.Name);
          // }
        }
      }
      await package.SaveAsAsync(uploadPath + "/package" + DateTime.UtcNow.Ticks);
      // var zipStream = new ZipOutputStream(null);
      // var c = ContentDispositionHeaderValue.Parse("asd");
      // var r = new StreamReader(file.OpenReadStream());
      return "OK";
    }
    
    [HttpGet("hello")]
    public string Hello()
    {
      log.Info("Method hello");
      return "It works!";
    }
  }
}