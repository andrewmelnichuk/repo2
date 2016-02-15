using Microsoft.AspNet.Mvc;

namespace Server.Api.Uploads
{
  [Route("uploads")]
  public class UploadsController : Controller
  {
    [HttpGet("index")]
    public IActionResult Index()
    {
      return View();
    }
  }
}