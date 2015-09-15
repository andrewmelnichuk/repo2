using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;

namespace Server.Api
{
  [Route("api/test")]
  public class TestController : Controller
  {
    private static TaskCompletionSource<string> tcs = new TaskCompletionSource<string>();
    
    [HttpGet("read")]
    public HttpContent Read()
    {
      return new StringContent("asd");
    }
    
    [HttpGet("write")]
    public void Write(string data)
    {
      tcs.SetResult("Hello world");
    }
  }
}