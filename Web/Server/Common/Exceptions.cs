using System;
using Server.Common.Entities;

namespace Server.Common
{
  public class Exceptions
  {
    public static EntityException EntityNotFound(int entityId, Type type)
    {
      return new EntityException(string.Format("Entity '{0}'#{1} not found", type.Name, entityId));
    }
    
    public static EntityException EntityDeleted(int entityId, Type type)
    {
      return new EntityException(string.Format("Entity '{0}'#{1} was deleted", type.Name, entityId));
    }
  }
}