using Microsoft.AspNet.Mvc;
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

      if (context.Exception is ServerException)
        context.Result = new JsonResult(new {success = false, message = context.Exception.Message});

      base.OnException(context);
    }
  }
}