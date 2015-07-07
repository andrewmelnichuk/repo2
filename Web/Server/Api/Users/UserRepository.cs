using System;
using System.IO;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using Newtonsoft.Json;

namespace Server.Features.Users
{
  public class Entity
  {
    public int Id;
    public Entity Clone()
    {
      return (Entity) MemberwiseClone();
    }
  }
  
  public static class Repository<T> where T : Entity
  {
    private static ConcurrentDictionary<int, T> Storage;
    
    static Repository()
    {
      var filePath = string.Format("./Data/{0}.json", typeof(T).Name);
      using (var stream = File.Open(filePath, FileMode.OpenOrCreate))
      using (var reader = new StreamReader(stream)) {
        var serializer = new JsonSerializer();
        Storage = (ConcurrentDictionary<int, T>) serializer.Deserialize(reader, typeof(ConcurrentDictionary<int, T>))
        ?? new ConcurrentDictionary<int, T>(); 
      }
    }
    
    public static T GetById(int id)
    {
      T entity;
      if (Storage.TryGetValue(id, out entity))
        return (T) entity.Clone();
      else
        throw NotFoundException(id);
    }
    
    public static void Add(T entity)
    {
      
    }
    
    public static void Delete(int id)
    {
      T entity;
      if (!Storage.TryRemove(id, out entity))
        throw NotFoundException(id);
    }
    
    public static bool Update(T entity)
    {
      T existing;
      if (Storage.TryGetValue(entity.Id, out existing))
        return Storage.TryUpdate(entity.Id, entity, existing);
      else
        throw NotFoundException(entity.Id);
    }
    
    public static List<T> GetAll()
    {
      return Storage.Values.Select(v => v.Clone()).Cast<T>().ToList();
    }
    
    private static ApplicationException NotFoundException(int id)
    {
      return new ApplicationException(string.Format("User #{0} not found", id));      
    }
  }
}