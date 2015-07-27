using System.IO;
using System.Threading;

namespace Server.Common.Data
{
  public static class Revision
  {
    private const string _revFilePath = "./Data/Rev";
    private const int _revCount = 100;

    private static long _maxRev;
    private static long _curRev;

    static Revision()
    {
      _curRev = ReadRev();
      _maxRev = _curRev + _revCount;
      WriteRev(_maxRev);
    }

    public static long Next()
    {
      var rev = Interlocked.Increment(ref _curRev);

      if (rev >= _maxRev)
      lock (typeof(Revision))
        if (rev >= _maxRev)
          WriteRev(_maxRev += _revCount);

      return rev;
    }

    private static long ReadRev()
    {
      long result;
      using (var stream = File.Open(_revFilePath, FileMode.OpenOrCreate))
      using (var reader = new StreamReader(stream))
        return long.TryParse(reader.ReadToEnd(), out result) ? result : 0; 
    }

    private static void WriteRev(long rev)
    {
      using (var stream = File.Open(_revFilePath, FileMode.Open))
      using (var writer = new StreamWriter(stream))
        writer.Write(rev.ToString());
    }
  }
}