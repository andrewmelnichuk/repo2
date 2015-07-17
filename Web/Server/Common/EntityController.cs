using System.Collections.Generic;
using Microsoft.AspNet.Mvc;

namespace Server.Common
{
  [Route("api/[controller]")]
  [CorsEnabled]
  public class EntityController<T> : Controller where T : Entity
  {
    [HttpGet("{id:int}")]
    public T Get(int id)
    {
      return Repository<T>.GetById(id); 
    }
    
    [HttpGet]
    public List<T> Get()
    {
      return Repository<T>.GetAll(true);
    }
    
    [HttpPost]
    public int Post([FromBody] T entity)
    {
      return Repository<T>.Add(entity);
    }
  }
}