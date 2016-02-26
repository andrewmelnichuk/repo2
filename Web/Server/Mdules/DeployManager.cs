using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ICSharpCode.SharpZipLib.Zip;
using Microsoft.AspNet.Http;
using Microsoft.Net.Http.Headers;
using NLog;
using Server.Common;
using Server.Modules.Branches;

namespace Server.Modules
{
  class Package
  {
    public string Name;
    public DateTime UploadTimeUtc;
    public string FileName;
    public PackageState State;

    public static Package FromFile(FileInfo file)
    {
      var ext = Path.GetExtension(file.Name);
      var tokens = file.Name.Split(new[] {"#"}, StringSplitOptions.RemoveEmptyEntries);
      return new Package {
        Name = tokens[0],
        UploadTimeUtc = new DateTime(Convert.ToInt64(tokens[1])),
        FileName = file.Name,
        State = ext == "dpl" ? PackageState.Deploying : PackageState.Waiting 
      };
    }
  }
  
  enum PackageState
  {
    Waiting,
    Deploying
  }
  
  public class DeployManager
  {
    private static Logger log = LogManager.GetLogger("DeployManager");

    private static Thread _packagesThread = new Thread(UploadThreadProc);
    private static ManualResetEvent _packageEvent = new ManualResetEvent(false);
    private static List<Package> _packages = new List<Package>();
    private static object _locker = new object();

    private static long DeployThreadsCount = 5;

    private static bool _initialized;

    public static void Initialize()
    {
      if (_initialized)
        Exceptions.ServerError("Deployment manager already initialized.");

      ReadModel();

      _packageEvent.Set();
      _packagesThread.Start();

      _initialized = true;
    }

    private static void ReadModel()
    {
      var uploadDir = new DirectoryInfo(AppPaths.Uploads);

      lock (_locker)
        _packages.AddRange(
          from file in uploadDir.GetFiles("*.zip|*.dpl")
          orderby System.IO.File.GetCreationTimeUtc(file.FullName)
          select Package.FromFile(file)
        );
    }

    public static async Task Upload(Stream inStream, string fileName)
    {
      var packageName = $"{fileName}#{DateTime.UtcNow.Ticks}";
      var packagePath = Path.Combine(AppPaths.Uploads, packageName);

      using (var outStream = new FileStream($"{packagePath}.tmp", FileMode.Create, FileAccess.Write))
        await inStream.CopyToAsync(outStream);

      System.IO.File.Move($"{packagePath}.tmp", $"{packagePath}.zip");

      lock (_locker) {
        var package = Package.FromFile(new FileInfo($"{packagePath}.zip"));
        _packages.Add(package);
        log.Info($"Package {package.Name}, uploaded at {package.UploadTimeUtc}");
      }

      _packageEvent.Set();
    }

    private static void UploadThreadProc()
    {
      while (true)
      {
        _packageEvent.WaitOne();

        var uqPackages = new HashSet<string>();
        var oldPackages = new List<Package>();

        lock (_locker) {
          for (var i = _packages.Count - 1; i >= 0; i--) {
            var package = _packages[i];
            if (!uqPackages.Contains(package.Name))
              uqPackages.Add(package.Name);
            else if (package.State == PackageState.Waiting)
              oldPackages.Add(package);
              _packages.RemoveAt(i);
          }
        }

        foreach (var package in oldPackages) {
          File.Delete(Path.Combine(AppPaths.Uploads, package.FileName));
          log.Info($"Remove expired package {package.Name}, uploaded at {package.UploadTimeUtc}");
        }

        lock (_locker) {
          for (var i = 0; i < _packages.Count && Interlocked.Read(ref DeployThreadsCount) > 0; i++) {
            if (_packages[i].State == PackageState.Waiting) {
              _packages[i].State = PackageState.Deploying; 
              Interlocked.Decrement(ref DeployThreadsCount);
              ThreadPool.QueueUserWorkItem(_ => DeployPackage(_packages[i]));
            }
          }
        }
/*
        var packageInfo = new PackageInfo(package.FullName);
        using (var cx = BranchManager.Edit(packageInfo.Branch))
        {
          if (cx.Branch == null || !cx.Branch.IsDeleted)
          {
            log.Info($"Unpack branch '{packageInfo.Branch}' from package '{package.Name}'.");
            using (var stream = System.IO.File.Open(package.FullName, FileMode.Open, FileAccess.Read))
            using (var zipStream = new ZipInputStream(stream))
            {
              ZipEntry entry;
              while ((entry = zipStream.GetNextEntry()) != null)
              {
                var entryPath = Path.Combine(AppPaths.Branches, entry.Name);
                if (entry.IsDirectory)
                  Directory.CreateDirectory(entryPath);
                else
                  using (var fileStream = System.IO.File.Create(entryPath))
                    zipStream.CopyTo(fileStream);
              }
            }
          }
          else {
            log.Info("Branch '{cx.Branch.Name}' was deleted.");
          }

          System.IO.File.Delete(package.FullName);
          log.Info($"Delete package {package.Name}.");

          cx.Complete();
        }
        */
      }
    }
    
    private static void DeployPackage(Package package)
    {
      log.Info($"Deploying package {package.Name}.");
      
      File.Move(Path.Combine(AppPaths.Uploads, package.FileName), Path.Combine(AppPaths.Uploads, package.))
    }
  }
}