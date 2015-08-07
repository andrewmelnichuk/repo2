using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Newtonsoft.Json;
using Server.Common.Changes;

namespace Server.Common.Data
{
  public class Repository<T> : IChangesProvider where T : Entity
  {
    private static int NextId;
    private static Dictionary<int, T> Storage;
    private static ReaderWriterLockSlim Lock = new ReaderWriterLockSlim();
    private static string FilePath = string.Format("./Data/{0}.json", typeof(T).Name);

    static Repository()
    {
      ReadStorage();
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
          throw new EntityNotFoundException(id, typeof(T));
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
      catch (EntityNotFoundException)
      {
        entity = null;
        return false;
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

    public static List<T> GetAll(bool includeDeleted)
    {
      Lock.EnterReadLock();
      try {
        return Storage.Values
          .Where(e => !e.IsDeleted || includeDeleted)
          .Select(v => v.Clone())
          .Cast<T>()
          .ToList();
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
        entity.Revision = Revision.Next();
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

    public static void Delete(int id)
    {
      T copy = null;

      Lock.EnterWriteLock();
      try {
        if (Storage.ContainsKey(id)) { 
          copy = (T) Storage[id].Clone(); 
          Storage[id].IsDeleted = true;
          Storage[id].Revision = Revision.Next();
          WriteStorage();
        }
      }
      catch {
        if (copy != null)
          Storage[copy.Id] = copy;
        throw;
      }
      finally {
        Lock.ExitWriteLock();
      }

      if (copy == null)
        throw new EntityNotFoundException(id, typeof(T));
    }

    public static void Update(T entity)
    {
      T copy = null;

      Lock.EnterWriteLock();
      try {
        if (Storage.ContainsKey(entity.Id)) {
          copy = (T) Storage[entity.Id].Clone(); 
          Storage[entity.Id] = entity;
          Storage[entity.Id].Revision = Revision.Next();
          WriteStorage();
        }
      }
      catch {
        if (copy != null)
          Storage[copy.Id] = copy;
        throw;
      }
      finally {
        Lock.ExitWriteLock();
      }

      if (copy == null)
        throw new EntityNotFoundException(entity.Id, typeof(T));
    }

    public List<Entity> GetChanges(long revision)
    {
      Lock.EnterReadLock();
      try {
        var result = new List<Entity>();
        foreach (var kvp in Storage)
          if (kvp.Value.Revision > revision)
            result.Add(kvp.Value);
        return result;
      }
      finally {
        Lock.ExitReadLock();
      }
    }

    private static void ReadStorage()
    {
      using (var stream = File.Open(FilePath, FileMode.OpenOrCreate, FileAccess.Read, FileShare.Read))
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