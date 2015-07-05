using System;

public class Program
{
  public static void Main(string[] args)
  {
    Channel.On<TestMessage>(m => Console.WriteLine(m.Id));
    
    Console.WriteLine("hello client");
  }
}