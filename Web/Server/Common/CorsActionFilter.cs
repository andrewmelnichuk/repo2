using Microsoft.AspNet.Mvc;

namespace Server.Common
{
  public class CorsEnabledAttribute : ActionFilterAttribute
  {
    public override void OnActionExecuted(ActionExecutedContext context) 
    {
      context.HttpContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] {"*"});
    }
  }
}