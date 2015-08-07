using FluentValidation;
using Server.Api.Apps;
using Server.Api.Nets;
using Server.Common.Data;

namespace Server.Api.Clusters
{
  public class ClusterValidator : AbstractValidator<Cluster>
  {
    public ClusterValidator()
    {
      RuleFor(c => c.AppId).Must(Repository<App>.Contains).WithMessage("Invalid app id");
      RuleFor(c => c.NetId).Must(Repository<Net>.Contains).WithMessage("Invalid net id");
      RuleFor(c => c.Master).NotEmpty().WithMessage("Master server required");
      RuleFor(c => c.Segments).NotEmpty().WithMessage("At least one segment required");
    }
  }
}