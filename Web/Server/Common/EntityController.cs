using System.Collections.Generic;
using Microsoft.AspNet.Mvc;
using Server.Common.Data;
using FluentValidation;
using NLog;

namespace Server.Common
{
    [CorsEnabled]
  [Route("api/[controller]")]
  public class EntityController<TEntity, TValidator> : Controller 
    where TEntity : Entity
    where TValidator : AbstractValidator<TEntity>, new()
  {
    private static Logger logger = LogManager.GetLogger("EntityController");

    [HttpGet("{id:int}")]
    public TEntity Get(int id)
    {
      logger.Info("get entity #{0}", id);
      return Repository<TEntity>.GetById(id); 
    }

    [HttpGet]
    public List<TEntity> Get()
    {
      logger.Info("get all entities");
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