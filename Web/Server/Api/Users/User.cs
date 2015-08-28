using Server.Common.Data;

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
