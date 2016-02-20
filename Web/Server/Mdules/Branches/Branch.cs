using System;

namespace Server.Modules.Branches
{
  public class Branch
  {
    public string Name;
    public long BuildNum;
    public DateTime Uploaded;
    public int Revision;
    public bool IsDeleted;
    
    public Branch Clone()
    {	
      return (Branch) MemberwiseClone();
    }
  }
}