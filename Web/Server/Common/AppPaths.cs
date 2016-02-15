using System;
using System.IO;

namespace Server.Common
{
  public static class AppPaths
  {
    public static string Root;
    public static string Work;
    public static string Uploads;
    public static string Branches;
    public static string Data;

    static AppPaths()
    {
      Root = new DirectoryInfo(Environment.CurrentDirectory).Parent.FullName;
      Work = Path.Combine(Root, "WorkDir");
      Uploads = Path.Combine(Work, "Uploads");
      Branches = Path.Combine(Work, "Branches");
      Data = Path.Combine(Work, "Data");

      if (!Directory.Exists(Work))
        Directory.CreateDirectory(Work);

      if (!Directory.Exists(Uploads))
        Directory.CreateDirectory(Uploads);

      if (!Directory.Exists(Branches))
        Directory.CreateDirectory(Branches);

      if (!Directory.Exists(Data))
        Directory.CreateDirectory(Data);
    }
  }
}