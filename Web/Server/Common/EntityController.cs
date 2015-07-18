using System.Collections.Generic;
using Microsoft.AspNet.Mvc;
using Server.Common.Data;

namespace Server.Common
{
  [CorsEnabled]
  [Route("api/[controller]")]
  public class EntityController<T> : Controller where T : Entity
  {
    private static Repository<T> _repo = new Repository<T>();
    
    [HttpGet("{id:int}")]
    public T Get(int id)
    {
      return _repo.GetById(id); 
    }
    
    [HttpGet]
    public List<T> Get()
    {
      return _repo.GetAll(true);
    }
    
    [HttpPost]
    public int Post([FromBody] T entity)
    {
      return _repo.Add(entity);
    }
  }
}