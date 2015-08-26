using Microsoft.AspNet.Mvc;
using Server.Common.Data;
using Server.Common.Changes;
using System.Collections.Generic;
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
    public List<Entity> Sync(long rev)
    {
      logger.Info("sync");
      return ChangesManager.GetChanges(rev);
    }
  }
}