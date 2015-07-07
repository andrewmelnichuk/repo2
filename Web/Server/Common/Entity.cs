namespace Server.Common
{
  public class Entity
  {
    public int Id;
    public Entity Clone()
    {
      return (Entity) MemberwiseClone();
    }
  }
} 