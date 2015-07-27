using System;

namespace Server.Common.Data
{
  public class EntityNotFoundException : ApplicationException
  {
    public EntityNotFoundException(int entityId, Type type)
      : base (string.Format("Entity '{0}'#{1} not found", type.Name, entityId))
    {}
  }
}