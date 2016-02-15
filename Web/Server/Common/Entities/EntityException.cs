namespace Server.Common.Entities
{
  public class EntityException: ServerException
  {
    public EntityException(string message)
      :base(message)
    {}
  } 
}