using System.Threading.Tasks;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Net.Http.Headers;
using Server.Common;
using Server.Modules.Branches;

namespace Server.Uploads
{
  [Route("branches")]
  public class BranchesController : Controller
  {
    [HttpGet("")]
    public IActionResult Index()
    {
      return View();
    }
  }
}