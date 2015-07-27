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

    public static List<Entity> GetChanges(long revision)
    {
      var result = new List<Entity>();
      foreach (var provider in _changeProviders)
        result.AddRange(provider.GetChanges(revision));
      return result;
    }
  }
}