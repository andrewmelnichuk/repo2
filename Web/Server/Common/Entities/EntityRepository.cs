using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Newtonsoft.Json;
using System;

namespace Server.Common.Entities
{
  public class EntityRepository<T> where T : Entity
  {
    private static int NextId;
    private static long NextRevision;
    private static Dictionary<int, T> Storage;
    private static ReaderWriterLockSlim Lock = new ReaderWriterLockSlim();
    private static string FilePath = $"{AppPaths.Data}/{typeof(T).Name}.json";

    static EntityRepository()
    {
      ReadStorage();
      NextId = Storage.Count > 0 ? Storage.Keys.Last() + 1 : 1;
      NextRevision = Storage.Count > 0 ? Storage.Values.Max(e => e.Revision) + 1 : 1;
    }

    public static T GetById(int id)
    {
      Lock.EnterReadLock();
      try {
        T entity;
        if (Storage.TryGetValue(id, out entity))
          return (T) entity.Clone();
        throw Exceptions.EntityNotFound(id, typeof(T));
      }
      finally {
        Lock.ExitReadLock();
      }
    }

    public static bool TryGetById(int id, out T entity)
    {
      try
      {
        entity = GetById(id);
        return true;
      }
      catch (EntityException)
      {
        entity = null;
        return false;
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

    public static List<T> GetAll(int revision)
    {
      if (revision < 0)
        throw new ArgumentException("revision must be greater or equal zero");

      Lock.EnterReadLock();
      try {
        return Storage.Values
          .Where(v => v.Revision > revision)
          .Select(v => v.Clone())
          .Cast<T>()
          .ToList();
      }
      finally {
        Lock.ExitReadLock();
      } 
    }

    public List<Entity> GetChanged(long revision)
    {
      Lock.EnterReadLock();
      try {
        var result = new List<Entity>();
        foreach (var kvp in Storage)
          if (kvp.Value.Revision > revision)
            result.Add(kvp.Value.Clone());
        return result;
      }
      finally {
        Lock.ExitReadLock();
      }
    }

    public static bool Contains(int id)
    {
      Lock.EnterReadLock();
      try {
        return Storage.ContainsKey(id);
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
        entity.Revision = NextRevision++;
        Storage.Add(entity.Id, entity);
        WriteStorage();
        return entity.Id;
      }
      catch {
        if (Storage.ContainsKey(entity.Id))
          Storage.Remove(entity.Id);
        throw;
      }
      finally {
        Lock.ExitWriteLock();
      }
    }

    public static int Update(T entity)
    {
      Lock.EnterWriteLock();
      try {
        if (!Storage.ContainsKey(entity.Id))
          Exceptions.EntityNotFound(entity.Id, typeof(T));
        if (Storage[entity.Id].IsDeleted)
          Exceptions.EntityDeleted(entity.Id, typeof(T));

        Storage[entity.Id] = entity;
        Storage[entity.Id].Revision = NextRevision++;
        WriteStorage();
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
        if (!Storage.ContainsKey(id))
          Exceptions.EntityNotFound(id, typeof(T));

        var entity = Storage[id];
        if (!entity.IsDeleted) {
          entity.IsDeleted = true;
          entity.Revision = NextRevision++;
          WriteStorage();
        }
      }
      finally {
        Lock.ExitWriteLock();
      }
    }

    private static void ReadStorage()
    {
      using (var stream = File.Open(FilePath, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.Read))
      using (var reader = new StreamReader(stream)) {
        var serializer = new JsonSerializer();
        Storage = (Dictionary<int, T>) serializer.Deserialize(reader, typeof(Dictionary<int, T>)) ?? new Dictionary<int, T>(); 
      }
    }

    private static void WriteStorage()
    {
      using (var stream = File.Open(FilePath, FileMode.Create, FileAccess.Write, FileShare.Read))
      using (var writer = new StreamWriter(stream)) {
        var serializer = new JsonSerializer();
        serializer.Serialize(writer, Storage); 
      }
      // TODO reinitialize on error
      // TODO atomic save (tmp file with rename???)
    }
  }
}