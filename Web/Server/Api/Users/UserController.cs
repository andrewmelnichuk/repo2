using System.Collections.Generic;
using Microsoft.AspNet.Mvc;
using Server.Features.Users;

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
}