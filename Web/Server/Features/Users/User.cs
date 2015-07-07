namespace Server.Features.Users
{
  public class User : Entity
  {
    public int Id { get; set; }
    public string Login;
    public string Password;
    public string FirstName;
    public string LastName;
    public string Address;
    public string Name;
  }  
}
