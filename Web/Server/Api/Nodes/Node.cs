using Server.Common.Data;

namespace Server.Api.Nodes
{
  public class Node : Entity
  {
    public string IpAddress;
    public string Description;
    public string RdpLogin;
    public string RdpPassword;
  }
}