using System;

namespace Server.Common.Entities
{
  public class EntityException: ApplicationException
  {
    public  EntityException(string message)
      :base(message)
    {}
  } 
}