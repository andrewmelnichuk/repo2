using System;
using Server.Common.Entities;

namespace Server.Common
{
  public class Exceptions
  {
    public static Exception EntityNotFound<TKey>(TKey key, Type type)
    {
      return new EntityException($"Entity {type.Name}#{key} not found");
    }
    
    public static Exception EntityDeleted<TKey>(TKey key, Type type)
    {
      return new EntityException($"Entity {type.Name}#{key} was deleted");
    }

    public static void ServerError(string message)
    {
      throw new ServerException(message);
    }
  }
}