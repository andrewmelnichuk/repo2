using Microsoft.AspNet.Mvc;

namespace Server.Common
{
  public class CorsEnabledAttribute : ActionFilterAttribute
  {
    public override void OnActionExecuted(ActionExecutedContext context) 
    {
      var headers = context.HttpContext.Response.Headers; 
      headers.Add("Access-Control-Allow-Origin", new[] {"*"});
      headers.Add("Access-Control-Allow-Headers", new[] {"Origin", "X-Requested-With", "Content-Type", "Accept"});
      headers.Add("Access-Control-Allow-Methods", new[] {"GET", "POST", "PUT"});
    }
  }
}