using Server.Common.Entities;

namespace Server.Api.Users
{
  public class User : Entity
  {
    public string Login;
    public string Password;
    public string FirstName;
    public string LastName;
  }
}
