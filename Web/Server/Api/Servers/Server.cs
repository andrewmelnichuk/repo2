using Server.Common.Data;

namespace Server.Api.Servers
{
  public class Server : Entity
  {
    public string IpAddress;
    public string Description;
    public string RdpLogin;
    public string RdpPassword;
  }
}