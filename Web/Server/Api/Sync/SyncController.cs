using Microsoft.AspNet.Mvc;
using Server.Common.Data;
using Server.Common.Changes;
using System.Collections.Generic;

namespace Server.Api.Sync
{
  [Route("api/[controller]")]
  public class SyncController: Controller
  {
    [HttpGet("index")]
    public List<Entity> Sync(long rev)
    {
      return ChangesManager.GetChanges(rev);
    }
  }
}