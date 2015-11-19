using Microsoft.AspNet.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace HelloMvc
{
    public class Startup
  {
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddMvc();
    }

    public void Configure(IApplicationBuilder app)
    {
      app.UseMvc(routes => {
        routes.MapRoute("default", "{controller=Home}/{action=Index}/{id?}");
      });

      app.UseWelcomePage();

      // LogManager.Configuration = new XmlLoggingConfiguration(Environment.CurrentDirectory + @"\nlog.config");      
    }
  }
}