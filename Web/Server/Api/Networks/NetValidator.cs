using FluentValidation;

namespace Server.Api.Nets
{
  public class NetValidator : AbstractValidator<Net>
  {
    public NetValidator()
    {
      RuleFor(net => net.Name).NotEmpty().WithMessage("Net name is required");
    }
  }
}