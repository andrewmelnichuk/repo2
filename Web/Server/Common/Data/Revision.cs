using System;
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
      ReadCurRev();
      _maxRev = _curRev + _revCount;
      WriteMaxRev();
    }
    
    // MUST be called under lock
    public static long Next(ReaderWriterLockSlim locker)
    {
      if (!locker.IsWriteLockHeld)
        throw new InvalidOperationException("Revision obtaining must be called under exclusive lock");
        
      if (_curRev == _maxRev) {
        _maxRev += _revCount;
        WriteMaxRev();
      }
      
      return ++_curRev;
    }
 
    private static void ReadCurRev()
    {
      using (var stream = File.Open(_revFilePath, FileMode.OpenOrCreate))
      using (var reader = new StreamReader(stream))
        _curRev = long.TryParse(reader.ReadToEnd(), out _curRev) ? _curRev : 0; 
    }
    
    private static void WriteMaxRev()
    {
      using (var stream = File.Open(_revFilePath, FileMode.Open))
      using (var writer = new StreamWriter(stream))
        writer.Write(_maxRev.ToString());
    }
  }
}