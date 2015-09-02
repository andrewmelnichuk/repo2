using System.Collections.Generic;

namespace Server.Common.Entities
{
    public class EntityResponse
  {
    public object Data;
    public IEnumerable<Entity> Updates;
  }
}