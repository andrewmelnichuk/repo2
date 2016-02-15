using System;
using Server.Common.Entities;

namespace Server.Common
{
  public class Exceptions
  {
    public static Exception EntityNotFound(int entityId, Type type)
    {
      return new EntityException($"Entity {type.Name}#{entityId} not found");
    }
    
    public static Exception EntityDeleted(int entityId, Type type)
    {
      return new EntityException($"Entity {type.Name}#{entityId} was deleted");
    }

    public static void ServerError(string message)
    {
      throw new ServerException(message);
    }
  }
}