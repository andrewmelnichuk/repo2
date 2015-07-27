using FluentValidation;
using Server.Api.Apps;
using Server.Api.Networks;
using Server.Common.Data;

namespace Server.Api.Clusters
{
  class ClusterValidator : AbstractValidator<Cluster>
  {
    public ClusterValidator()
    {
      RuleFor(c => c.AppId).Must(BeAValid<App>).WithMessage("Invalid app id");
      RuleFor(c => c.NetId).Must(BeAValid<Net>).WithMessage("Invalid net id");
    }

    private bool BeAValid<T>(int entityId) where T : Entity
    {
      T entity;
      return new Repository<T>().TryGetById(entityId, out entity);
    }
  }
}