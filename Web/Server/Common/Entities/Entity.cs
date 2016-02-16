namespace Server.Common.Entities
{
  public class Entity
  {
    public long Revision;
    public bool IsDeleted;
    
    public Entity Clone()
    {	
      return (Entity) MemberwiseClone();
    }
  }
} 