using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using ICSharpCode.SharpZipLib.Zip;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Net.Http.Headers;
using NLog;
using Server.Common.Entities;

namespace Server.Api.Apps
{
  public class AppsController : EntityController<App, AppValidator>
  {
    private static Logger log = LogManager.GetLogger("apps");
    
    [HttpPost("upload")]
    public async Task<string> Upload(IList<IFormFile> files, string json)
    {
      log.Info(files.Count);
      log.Info(json);
      log.Info(Environment.CurrentDirectory);
      var uploadPath = Environment.CurrentDirectory + "/Uploads";

      if (!Directory.Exists(uploadPath))
        Directory.CreateDirectory(uploadPath);

      foreach (var file in files) {
        await file.SaveAsAsync(uploadPath + "/image" + DateTime.UtcNow.Ticks);
      }
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