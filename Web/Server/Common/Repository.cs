using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Newtonsoft.Json;

namespace Server.Common
{
  public static class Repository<T> where T : Entity
  {
    private static int NextId;
    private static Dictionary<int, T> Storage;
    private static ReaderWriterLockSlim Lock = new ReaderWriterLockSlim();
    private static string FilePath = string.Format("./Data/{0}.json", typeof(T).Name);
    
    static Repository()
    {
      using (var stream = File.Open(FilePath, FileMode.OpenOrCreate))
      using (var reader = new StreamReader(stream)) {
        var serializer = new JsonSerializer();
        Storage = (Dictionary<int, T>) serializer.Deserialize(reader, typeof(Dictionary<int, T>)) ?? new Dictionary<int, T>(); 
      }
      NextId = Storage.Count > 0 ? Storage.Keys.Last() + 1 : 1;
    }
    
    public static T GetById(int id)
    {
      Lock.EnterReadLock();
      try {
        T entity;
        if (Storage.TryGetValue(id, out entity))
          return (T) entity.Clone();
        else
          throw NotFoundException(id);
      }
      finally {
        Lock.ExitReadLock();
      }
    }
    
    public static List<T> GetByIds(int[] ids)
    {
      Lock.EnterReadLock();
      try {
        return Storage
          .Where(kvp => ids.Contains(kvp.Key))
          .Select(kvp => kvp.Value.Clone())
          .Cast<T>()
          .ToList();        
      }
      finally {
        Lock.ExitReadLock();
      }
    }
    
    public static List<T> GetAll()
    {
      Lock.EnterReadLock();
      try {
        return Storage.Values.Select(v => v.Clone()).Cast<T>().ToList();
      }
      finally {
        Lock.ExitReadLock();
      } 
    }

    public static int Add(T entity)
    {
      Lock.EnterWriteLock();
      try {
        entity.Id = NextId++;
        Storage.Add(entity.Id, entity);
        Save();
        return entity.Id;
      }
      finally {
        Lock.ExitWriteLock();
      }
    }
    
    public static void Delete(int id)
    {
      Lock.EnterWriteLock();
      try {
        if (!Storage.Remove(id))
          throw NotFoundException(id);
        Save();
      }
      finally {
        Lock.ExitWriteLock();
      }
    }
    
    public static void Update(T entity)
    {
      Lock.EnterWriteLock();
      try {
        if (!Storage.ContainsKey(entity.Id))
          throw NotFoundException(entity.Id);
        Storage[entity.Id] = entity;
        Save();
      }
      finally {
        Lock.ExitWriteLock();
      }
    }

    private static void Save()
    {
      using (var stream = File.Open(FilePath, FileMode.Create))
      using (var writer = new StreamWriter(stream)) {
        var serializer = new JsonSerializer();
        serializer.Serialize(writer, Storage); 
      }
      // TODO reinitialize on error
      // TODO atomic save (tmp file with rename???)
    }
    
    private static ApplicationException NotFoundException(int id)
    {
      return new ApplicationException(string.Format("Entity #{0} of type '{1}' not found", id, typeof(T).Name));      
    }
  }
}