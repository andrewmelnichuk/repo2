using Microsoft.AspNet.Mvc;
using Server.Common.Changes;
using Server.Common;
using NLog;

namespace Server.Api.Sync
{
    [CorsEnabled]
  [Route("api/[controller]")]
  public class SyncController: Controller
  {
    private static Logger logger = LogManager.GetCurrentClassLogger();
    
    [HttpGet("index")]
    public ChangesResult Sync(long rev)
    {
      logger.Info("sync");
      return ChangesManager.GetChanges(rev);
    }
  }
}