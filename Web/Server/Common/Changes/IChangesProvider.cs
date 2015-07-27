using System.Collections.Generic;
using Server.Common.Data;

namespace Server.Common.Changes
{
  public interface IChangesProvider
  {
    List<Entity> GetChanges(long revision);
  }
}