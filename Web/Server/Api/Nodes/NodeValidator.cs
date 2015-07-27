using FluentValidation;

namespace Server.Api.Nodes
{
  public class NodeValidator : AbstractValidator<Node>
  {
    public NodeValidator()
    {
      RuleFor(node => node.IpAddress).NotEmpty().WithMessage("Server's ip address is required");
    }
  }
}