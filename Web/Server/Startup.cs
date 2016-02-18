using System;
using Microsoft.AspNet.Builder;
using Microsoft.Extensions.DependencyInjection;
using NLog;
using NLog.Config;
using Server.Common;
using Server.Modules.Branches;

namespace HelloMvc
{
    public class Startup
  {
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddMvc(options => options.Filters.Add(typeof(ExceptionFilter)));
    }

    public void Configure(IApplicationBuilder app)
    {
      app.UseMvc(routes => {
        routes.MapRoute("default", "{controller=Home}/{action=Index}/{id?}");
      });

      // app.Use(async (context, next) =>
      // {
      //   Console.WriteLine("My middleware");
      //   Console.WriteLine(context.Request.Path);
      //   await next();
      // });

      app.UseWelcomePage();
      app.UseDeveloperExceptionPage();

      LogManager.Configuration = new XmlLoggingConfiguration(Environment.CurrentDirectory + @"\nlog.config");
      
      BranchManager.Initialize();
    }
  }
}