using Server.Common;

namespace Server.Api.Services
{
  public enum ServiceType
  {
    Master = 0,
    Segment = 1
  }
  
  public class Service : Entity
  {
    public string Name;
    public ServiceType Type;
  }
}