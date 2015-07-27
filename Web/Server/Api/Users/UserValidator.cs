using FluentValidation;

namespace Server.Api.Users
{
  public class UserValidator : AbstractValidator<User>
  {
    public UserValidator()
    {
      RuleFor(user => user.Login).NotEmpty().WithMessage("User's login is required");
    }
  }
}