using Microsoft.AspNet.Mvc.Filters;
using NLog;

namespace Server.Common
{
  public class ExceptionFilter: ExceptionFilterAttribute
  {
    private static Logger log = LogManager.GetLogger("Errors");

    public override void OnException(ExceptionContext context)
    {
      log.Error(context.Exception);
      base.OnException(context);
    }
  }
}