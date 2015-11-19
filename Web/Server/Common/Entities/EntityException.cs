using System;

namespace Server.Common.Entities
{
  public class EntityException: Exception
  {
    public  EntityException(string message)
      :base(message)
    {}
  } 
}