using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Newtonsoft.Json;
using System;

namespace Server.Common.Entities
{
  public class EntityRepository<TKey, TEntity> where TEntity : Entity
  {
    private static long NextRevision;
    private static Dictionary<TKey, TEntity> Storage;
    private static ReaderWriterLockSlim Lock = new ReaderWriterLockSlim();
    private static string FilePath = $"{AppPaths.Data}/{typeof(TEntity).Name}.json";

    static EntityRepository()
    {
      ReadStorage();
      NextRevision = Storage.Count > 0 ? Storage.Values.Max(e => e.Revision) + 1 : 1;
    }

    public static TEntity GetByKey(TKey key)
    {
      Lock.EnterReadLock();
      try {
        TEntity entity;
        if (Storage.TryGetValue(key, out entity))
          return (TEntity) entity.Clone();
        throw Exceptions.EntityNotFound(key, typeof(TEntity));
      }
      finally {
        Lock.ExitReadLock();
      }
    }

    public static bool TryGetByKey(TKey key, out TEntity entity)
    {
      try
      {
        entity = GetByKey(key);
        return true;
      }
      catch (EntityException)
      {
        entity = null;
        return false;
      }
    }

    public static List<TEntity> GetByKeys(TKey[] keys)
    {
      Lock.EnterReadLock();
      try {
        return Storage
          .Where(kvp => keys.Contains(kvp.Key))
          .Select(kvp => kvp.Value.Clone())
          .Cast<TEntity>()
          .ToList();
      }
      finally {
        Lock.ExitReadLock();
      }
    }

    public static List<TEntity> GetAll(int revision)
    {
      if (revision < 0)
        throw new ArgumentException("revision must be greater or equal zero");

      Lock.EnterReadLock();
      try {
        return Storage.Values
          .Where(v => v.Revision > revision)
          .Select(v => v.Clone())
          .Cast<TEntity>()
          .ToList();
      }
      finally {
        Lock.ExitReadLock();
      } 
    }

    public List<TEntity> GetChanged(long revision)
    {
      Lock.EnterReadLock();
      try {
        var result = new List<TEntity>();
        foreach (var kvp in Storage)
          if (kvp.Value.Revision > revision)
            result.Add((TEntity)kvp.Value.Clone());
        return result;
      }
      finally {
        Lock.ExitReadLock();
      }
    }

    public static bool Contains(TKey key)
    {
      Lock.EnterReadLock();
      try {
        return Storage.ContainsKey(key);
      }
      finally {
        Lock.ExitReadLock();
      }
    }

    public static void Add(TKey key, TEntity entity)
    {
      Lock.EnterWriteLock();
      try {
        entity.Revision = NextRevision++;
        Storage.Add(key, entity);
        WriteStorage();
      }
      finally {
        Lock.ExitWriteLock();
      }
    }

    public static void Update(TKey key, TEntity entity)
    {
      Lock.EnterWriteLock();
      try {
        if (!Storage.ContainsKey(key))
          Exceptions.EntityNotFound(key, typeof(TEntity));
        if (Storage[key].IsDeleted)
          Exceptions.EntityDeleted(key, typeof(TEntity));

        entity.Revision = NextRevision++;
        Storage[key] = entity;
        WriteStorage();
      }
      finally {
        Lock.ExitWriteLock();
      }
    }

    public static void AddOrUpdate(TKey key, TEntity entity)
    {
      Lock.EnterWriteLock();
      try {
        if (!Storage.ContainsKey(key) || !Storage[key].IsDeleted) {
          entity.Revision = NextRevision++;
          Storage[key] = entity;
        }
        else {
          Exceptions.EntityDeleted(key, typeof(TEntity));
        }
        WriteStorage();
      }
      finally {
        Lock.ExitWriteLock();
      }
    }

    public static void Update(TKey key, Action<TEntity> edit)
    {
      Lock.EnterWriteLock();
      try {
        if (!Storage.ContainsKey(key))
          Exceptions.EntityNotFound(key, typeof(TEntity));
        if (Storage[key].IsDeleted)
          Exceptions.EntityDeleted(key, typeof(TEntity));

        var entity = Storage[key];
        if (edit != null)
        {
          edit(entity);
          entity.Revision = NextRevision++;
        }
      }
      finally {
        Lock.ExitWriteLock();
      }
    }

    public static void Delete(TKey key)
    {
      Lock.EnterWriteLock();
      try {
        if (!Storage.ContainsKey(key))
          Exceptions.EntityNotFound(key, typeof(TEntity));

        var entity = Storage[key];
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
        Storage = (Dictionary<TKey, TEntity>) serializer.Deserialize(reader, typeof(Dictionary<TKey, TEntity>)) 
          ?? new Dictionary<TKey, TEntity>(); 
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