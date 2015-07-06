using System;

public class Program
{
  public static void Main(string[] args)
  {
    Console.WriteLine("--- Server ---");
    
    Channel.On<TestMessage>(m => Console.WriteLine(m.Id));
    
    
    Console.WriteLine("Press any key to exit...");
    Console.ReadLine();
  }
}