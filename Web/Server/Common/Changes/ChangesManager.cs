using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Server.Common.Data;

namespace Server.Common.Changes
{
  public static class ChangesManager
  {
    private static List<IChangesProvider> _changeProviders;
    
    static ChangesManager()
    {
      _changeProviders = Assembly.GetExecutingAssembly().GetTypes()
        .Where(type => type.IsSubclassOf(typeof(Entity)))
        .Select(entityType => typeof(Repository<>).MakeGenericType(entityType))
        .Select(repoType => (IChangesProvider) Activator.CreateInstance(repoType))
        .ToList();
    }

    public static ChangesResult GetChanges(long revision)
    {
      var result = new ChangesResult();
      foreach (var provider in _changeProviders) {
        var changes = provider.GetChanges(revision);
        if (changes.Count > 0)
          result.Add(provider.EntityType, changes);
      }
      return result;
    }
  }
  
  public class ChangesResult : Dictionary<string, List<Entity>>
  {
  }
}