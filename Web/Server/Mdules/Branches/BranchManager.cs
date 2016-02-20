using System;
using System.Collections.Concurrent;
using System.IO;
using System.Threading;
using NLog;
using Server.Common;

namespace Server.Modules.Branches
{
  public class BranchManager
  {
    private static Logger log = LogManager.GetLogger("BranchManager");

    private static ConcurrentDictionary<string, Branch> _branches = new ConcurrentDictionary<string, Branch>();
    private static ConcurrentDictionary<string, object> _locks = new ConcurrentDictionary<string, object>();
    
    private static int _revision;

    private static bool _initialized;

    public class EditContext : IDisposable
    {
      private bool _lockTaken;
      private bool _completed;
      private object _lockObj;
      private string _branchName;
      
      public Branch Branch;

      public EditContext(string branchName)
      {
        _branchName = branchName;

        _lockObj = _locks.GetOrAdd(_branchName.ToLower(), new object()); 

        Branch branch;
        if (_branches.TryGetValue(_branchName, out branch))
          Branch = (Branch) branch.Clone();

        Monitor.TryEnter(_lockObj, ref _lockTaken);
        
        if (_lockTaken)  
          log.Info($"Obtained lock for branch '{_branchName}'.");
        else
          Exceptions.ServerError("Unable to obtain lock for branch '{_branchName}'.");
      }

      public void Complete()
      {
        WriteRevision(Branch.Name, ++_revision);

        var new_ = ReadBranch(_branchName);
        var current = _branches[_branchName];

        _branches.TryUpdate(_branchName, new_, current);

        _completed = true;
      }

      public void Dispose()
      {
        // if (!_completed) ????
        if (_lockTaken) {
          Monitor.Exit(_lockObj);
          log.Info($"Release lock for branch '{_branchName}'.");
        }
      }
    }

    static BranchManager()
    {
      Initialize();
    }

    public static void Initialize()
    {
      if (_initialized) {
        log.Info("Already initialized.");
        return;
      }

      ReadBranches();
    }

    public static EditContext Edit(string branchName)
    {
      return new EditContext(branchName);
    }

    private static void ReadBranches()
    {
      var branchPaths = Directory.GetDirectories(AppPaths.Branches);
      foreach (var branchPath in branchPaths) {
        var branchName = Path.GetFileName(branchPath);
        var branch = ReadBranch(branchName);
        if (branch.Revision < 0) {
          log.Info($"Branch '{branchName}' doesn't have revision. Skipped.");
          continue;
        }
        _branches[branch.Name] = branch;
        _revision = Math.Max(_revision, branch.Revision);
      }
    }

    private static Branch ReadBranch(string branchName)
    {
      return new Branch { 
        Name = branchName,
        Revision = ReadRevision(branchName), 
        BuildNum = 123, 
        Uploaded = DateTime.UtcNow
      };
    }

    private static int ReadRevision(string branchName, int notFound = -1)
    {
      int rev;
      var revPath = Path.Combine(AppPaths.Branches, branchName, ".rev");
      using (var reader = new StreamReader(revPath))
        return int.TryParse(reader.ReadLine(), out rev) ? rev : notFound;
    }

    private static void WriteRevision(string branchName, int revision)
    {
      var revPath = Path.Combine(AppPaths.Branches, branchName, ".rev");
      using (var stream = new FileStream(revPath, FileMode.OpenOrCreate, FileAccess.Write))
      using (var writer = new StreamWriter(stream))
        writer.WriteLine(revision);
    }
  }
}