using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using NLog;
using Server.Common;

namespace Server.Uploads
{
  [Route("updates")]
  public class UpdatesController : Controller
  {
    private static Logger log = LogManager.GetLogger("UpdatesController");

    class UpdateRequest
    {
      public DateTime StartTime;
      public TaskCompletionSource<long> Completion;
      public HttpRequest Request;
      public string Source;
    }
    
    private static ConcurrentDictionary<string, UpdateRequest> _updates = new ConcurrentDictionary<string, UpdateRequest>(); 
    private static Thread _completionThread = new Thread(CompletionThreadProc);

    static UpdatesController()
    {
      _completionThread.Start();
    }

    [HttpPost]
    public Task<long> Index()
    {
      // var conn = Request.HttpContext.Connection;  
      // var requestSource = conn.IsLocal 
      //   ? conn.LocalIpAddress.ToString() + ":" + conn.LocalPort.ToString()
      //   : conn.RemoteIpAddress.ToString() + ":" + conn.RemotePort.ToString(); 

      var updRequest = new UpdateRequest {
        StartTime = DateTime.UtcNow,
        Completion = new TaskCompletionSource<long>(),
        Request = Request,
        Source = "123"
      };

      if (_updates.TryAdd(updRequest.Source, updRequest))
        log.Info($"Update request from '{updRequest.Source}' added.");
      else
        Exceptions.ServerError("Update request from same remote addr/port already exists.");

      return updRequest.Completion.Task;
    }
    
    private static void CompletionThreadProc()
    {
      var completeTimeoutMs = 3000;
      var waitTimeoutMs = 0;
      
      var evnt = new AutoResetEvent(true);
       
      while (true) {

        evnt.WaitOne(waitTimeoutMs);
        
        if (_updates.Count == 0) {
          waitTimeoutMs = 1000;
          continue;
        }

        var completed = new List<UpdateRequest>();

        var nearestCompleteTime = DateTime.MaxValue;
        foreach (var items in _updates) {
          var request = items.Value;
          if ((DateTime.UtcNow - request.StartTime).TotalMilliseconds >= completeTimeoutMs)
            completed.Add(request);
          else
            nearestCompleteTime = new DateTime(Math.Min(nearestCompleteTime.Ticks, request.StartTime.AddMilliseconds(completeTimeoutMs).Ticks));
        }

        foreach (var request in completed) {
          UpdateRequest req;
          _updates.TryRemove(request.Source, out req);
          ThreadPool.QueueUserWorkItem(_ => {
            request.Completion.SetResult(DateTime.UtcNow.Second);
          });
        }

        waitTimeoutMs = (DateTime.UtcNow < nearestCompleteTime) 
          ? (int)(nearestCompleteTime - DateTime.UtcNow).TotalMilliseconds
          : 0;
          log.Info(waitTimeoutMs);
      }
    }
  }
}