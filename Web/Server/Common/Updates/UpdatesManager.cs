using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Server.Common.Data;

namespace Server.Common.Updates
{
  public static class UpdatesManager
  {
    private static List<IUpdatesProvider> _updadeProviders;
    
    static UpdatesManager()
    {
      _updadeProviders = Assembly.GetExecutingAssembly().GetTypes()
        .Where(type => type.IsSubclassOf(typeof(Entity)))
        .Select(entityType => typeof(Repository<>).MakeGenericType(entityType))
        .Select(repoType => (IUpdatesProvider) Activator.CreateInstance(repoType))
        .ToList();     
    }
    
    public static List<Entity> GetUpdates(long revision)
    {
      var result = new List<Entity>();
      foreach (var provider in _updadeProviders)
        result.AddRange(provider.GetUpdates(revision));
      return result;      
    }
  }
}