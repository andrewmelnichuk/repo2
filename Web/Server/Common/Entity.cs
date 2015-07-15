namespace Server.Common
{
  public class Entity
  {
    public int Id;
    public int Revision;    
    
    public Entity Clone()
    {
      return (Entity) MemberwiseClone();
    }
  }
} 