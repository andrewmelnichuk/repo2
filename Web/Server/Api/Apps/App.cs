using Server.Common.Entities;

namespace Server.Api.Apps
{
  public class App : Entity
  {
    public string Name;
    public string Code;
    public int InternalId;
  }
}