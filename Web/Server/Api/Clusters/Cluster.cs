using System.Collections.Generic;
using Server.Common.Data;

namespace Server.Api.Clusters
{
  public class Cluster : Entity
  {
    public int AppId;
    public int NetId;
    public Service Master;
    public List<Service> Segments;
  }
}