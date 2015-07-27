using FluentValidation;

namespace Server.Api.Apps
{
  public class AppValidator : AbstractValidator<App>
  {
    public AppValidator()
    {
      RuleFor(app => app.Name).NotEmpty().WithMessage("App name is required");
    }
  }
}