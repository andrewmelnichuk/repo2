using FluentValidation;
using Server.Api.Apps;
using Server.Api.Nets;
using Server.Common.Entities;

namespace Server.Api.Clusters
{
  public class ClusterValidator : AbstractValidator<Cluster>
  {
    public ClusterValidator()
    {
      RuleFor(c => c.AppId).Must(EntityRepository<App>.Contains).WithMessage("Invalid app id");
      RuleFor(c => c.NetId).Must(EntityRepository<Net>.Contains).WithMessage("Invalid net id");
      RuleFor(c => c.Master).NotEmpty().WithMessage("Master server required");
      RuleFor(c => c.Segments).NotEmpty().WithMessage("At least one segment required");
    }
  }
}