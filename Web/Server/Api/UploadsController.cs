using System.Threading.Tasks;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Net.Http.Headers;
using Server.Common;
using Server.Modules.Branches;

namespace Server.Uploads
{
  [Route("uploads")]
  public class UploadsController : Controller
  {
    [HttpGet("index")]
    public IActionResult Index()
    {
      return View();
    }
    
    [HttpPost("")]
    public async Task Upload(IFormFile package)
    {
      if (package == null || package.Length == 0)
        Exceptions.ServerError("Invalid package file");

      var fileName = ContentDispositionHeaderValue.Parse(package.ContentDisposition).FileName.Trim('"');
      var packageInfo = new PackageInfo(fileName);

      var branchPath = AppPaths.Uploads + "/" + packageInfo.Name;
      
      if (System.IO.File.Exists(branchPath + ".zip"))
        System.IO.File.Delete(branchPath + ".zip");
      if (System.IO.File.Exists(branchPath + ".tmp"))
        System.IO.File.Delete(branchPath + ".tmp");
      
      await package.SaveAsAsync(branchPath + ".tmp");
      System.IO.File.Move($"{branchPath}.tmp", $"{branchPath}.zip");
      UploadManager.PackageUploaded();
    }
  }
}