using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace Skoruba.Duende.IdentityServer.Admin.Helpers
{
    public static class StartupHelpers
    {
        public static void AddAdminUIRazorRuntimeCompilation(this IServiceCollection services, IWebHostEnvironment hostingEnvironment)
        {
#if DEBUG
            if (hostingEnvironment.IsDevelopment())
            {
                var builder = services.AddControllersWithViews();

                var adminAssembly = typeof(StartupHelpers).GetTypeInfo().Assembly.GetName().Name;

                builder.AddRazorRuntimeCompilation(options =>
                {
                    if (adminAssembly == null) return;

                    var libraryPath = Path.GetFullPath(Path.Combine(hostingEnvironment.ContentRootPath, "..", adminAssembly));
                    options.FileProviders.Add(new PhysicalFileProvider(libraryPath));
                });
            }
#endif
        }
    }
}