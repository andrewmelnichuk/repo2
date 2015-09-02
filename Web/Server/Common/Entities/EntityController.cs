using System.Collections.Generic;
using Microsoft.AspNet.Mvc;
using FluentValidation;
using NLog;

namespace Server.Common.Entities
{
    [CorsEnabled]
  [Route("api/[controller]")]
  public class EntityController<TEntity, TValidator> : Controller 
    where TEntity : Entity
    where TValidator : AbstractValidator<TEntity>, new()
  {
    private static Logger logger = LogManager.GetLogger("EntityController");
    private static TValidator Validator = new TValidator();

    [HttpGet("{id:int}")]
    public TEntity Get(int id)
    {
      logger.Info("get entity #{0}", id);
      return EntityRepository<TEntity>.GetById(id); 
    }

    [HttpGet]
    public List<TEntity> GetAll([FromQuery] int rev)
    {
      logger.Info("get all entities");
      return EntityRepository<TEntity>.GetAll(rev);
    }

    [HttpPost]
    public virtual EntityResponse Save([FromBody] TEntity entity, [FromQuery] int? rev)
    {
      Validator.ValidateAndThrow(entity);
      return new EntityResponse{ 
        Data = (entity.Id == 0) ? EntityRepository<TEntity>.Add(entity) : EntityRepository<TEntity>.Update(entity), 
        Updates = (rev != null) ? EntityRepository<TEntity>.GetAll(rev.Value) : null };
    }
  }
}