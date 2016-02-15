using System;
using System.IO;

namespace Server.Common
{
  public class PackageInfo
  {
    public string Branch;
    public long BuildNum;
    
    public PackageInfo(string filePath)
    {
      var fileName = Path.GetFileNameWithoutExtension(filePath);
      var tokens = fileName.Split(new[] {"#"}, StringSplitOptions.RemoveEmptyEntries);
      if (tokens.Length < 2)
        Exceptions.ServerError($"Invalid package name '{fileName}'.");

      long buildNum;
      if (!Int64.TryParse(tokens[1], out buildNum))
        Exceptions.ServerError($"Invalid package build number '{fileName}'.");

      Branch = tokens[0];
      BuildNum = buildNum;
    }
    
    public string Name
    {
      get { return $"{Branch}#{BuildNum}"; }
    }
  }
}
