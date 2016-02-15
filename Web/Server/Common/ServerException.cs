using System;

namespace Server.Common
{
  public class ServerException : Exception
  {
    public ServerException(string message)
      :base(message)
    {}
  }
}