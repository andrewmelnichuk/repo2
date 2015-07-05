using System;
using System.IO;
using System.Collections.Generic;

public class Channel
{
  private static Dictionary<Type, Handler> Handlers = new Dictionary<Type, Handler>(); 
    
  public Channel()
  {
    
  }
  
  public void Listen()
  {
    
  }
  
  public void Open()
  {
    
  }
  
  public void Close()
  {
    
  }
  
  public static void On<T>(Handler handler) where T: Message
  {
  }
  
  public static void Off<T>(Handler handler) where T: Message
  {
  }
}

public abstract class Message: ISerializable
{
  public int Id;
  public abstract void Write(BinaryWriter writer);
  public abstract void Read(BinaryReader reader);
}

public interface ISerializable
{
  void Write(BinaryWriter writer);
  void Read(BinaryReader reader);
}

public delegate void Handler(Message message);