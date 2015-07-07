using Microsoft.AspNet.Mvc;
using Server.Features.Users;

[Route("api/[controller]")]
public class UserController : Controller
{
  [HttpGet("{id:int}")]
  public object Get(int id)
  {
    var user = UserRepository.GetById(id); 
    return user ?? (object)"Not found";
  }
}