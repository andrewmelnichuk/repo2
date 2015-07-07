using System.Collections.Generic;
using Microsoft.AspNet.Mvc;
using Server.Common;

namespace Server.Api.Users
{
  [Route("api/[controller]")]
  public class UsersController : Controller
  {
    [HttpGet("{id:int}")]
    public User Get(int id)
    {
      return Repository<User>.GetById(id); 
    }
    
    [HttpGet]
    public List<User> Get()
    {
      return Repository<User>.GetAll();
    }
    
    [HttpPost]
    public int Post([FromBody] User user)
    {
      return Repository<User>.Add(user);
    }
  }
}