namespace Server.Common
{
  public class Entity
  {
    public int Id;
    public long Revision;
    public bool IsDeleted;
    
    public Entity Clone()
    {
      return (Entity) MemberwiseClone();
    }
  }
} 