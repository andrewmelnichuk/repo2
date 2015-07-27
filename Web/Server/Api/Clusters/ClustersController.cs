using Microsoft.AspNet.Mvc;
using Server.Common;
using FluentValidation;

namespace Server.Api.Clusters
{
  public class ClustersController : EntityController<Cluster>
  {
    public override int Post([FromBody] Cluster cluster)
    {
      var validator = new ClusterValidator();
      validator.ValidateAndThrow(cluster);
      return base.Post(cluster);
    } 
  }
}