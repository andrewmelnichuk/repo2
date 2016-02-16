using System;
using Server.Common.Entities;

namespace Server.Modules.Branches
{
  public class Branch : Entity
  {
    public string Name;
    public long BuildNum;
    public DateTime Uploaded;
  }
}