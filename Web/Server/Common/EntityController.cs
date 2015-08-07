using System.Collections.Generic;
using Microsoft.AspNet.Mvc;
using Server.Common.Data;
using FluentValidation;

namespace Server.Common
{
  [CorsEnabled]
  [Route("api/[controller]")]
  public class EntityController<TEntity, TValidator> : Controller 
    where TEntity : Entity
    where TValidator : AbstractValidator<TEntity>, new()
  {
    [HttpGet("{id:int}")]
    public TEntity Get(int id)
    {
      return Repository<TEntity>.GetById(id); 
    }

    [HttpGet]
    public List<TEntity> Get()
    {
      return Repository<TEntity>.GetAll(true);
    }

    [HttpPost]
    public virtual int Post([FromBody] TEntity entity)
    {
      new TValidator().ValidateAndThrow(entity);
      return Repository<TEntity>.Add(entity);
    }
  }
}