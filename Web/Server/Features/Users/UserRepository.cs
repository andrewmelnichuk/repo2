using System.Collections.Generic;

namespace Server.Features.Users
{
  public static class UserRepository
  {
    private static volatile Dictionary<int, User> UserStorage = new Dictionary<int, User>{
      {1, new User{ Id = 1, Name = "John", Password = "123" }}
    };
    
    static UserRepository()
    {
      
    }
    
    public static User GetById(int id)
    {
      var storage = UserStorage;
      if (storage != null)
      {
        User user;
        return (storage.TryGetValue(id, out user)) ? user : null;
      }
      return null;
    }
  }
}