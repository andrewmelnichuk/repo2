using System.Collections.Generic;
using Server.Common.Data;

namespace Server.Common.Updates
{
  public interface IUpdatesProvider
  {
    List<Entity> GetUpdates(long revision);
  }
}