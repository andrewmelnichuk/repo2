using System.Threading.Tasks;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Net.Http.Headers;
using Server.Common;
using Server.Modules;

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
    public async Task Upload(IFormFile file)
    {
      if (file == null || file.Length == 0)
        Exceptions.ServerError("Invalid file.");

      var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');

      using (var stream = file.OpenReadStream())
        await DeployManager.Upload(stream, fileName);
    }
  }
}