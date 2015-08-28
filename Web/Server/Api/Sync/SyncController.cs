using Microsoft.AspNet.Mvc;
using Server.Common.Changes;
using Server.Common;

namespace Server.Api.Sync
{
    [CorsEnabled]
  [Route("api/[controller]")]
  public class SyncController: Controller
  {
    [HttpGet("index")]
    public ChangesResult Sync(long rev)
    {
      return ChangesManager.GetChanges(rev);
    }
  }
}