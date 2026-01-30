using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Services
{
    public static class SkorubaAdminUIExtensions
    {
        /// <summary>
        /// Registers Skoruba Admin UI services into DI.
        /// </summary>
        public static IServiceCollection AddSkorubaAdminUI(this IServiceCollection services,
            Action<SkorubaAdminUIOptions>? configure = null)
        {
            var options = new SkorubaAdminUIOptions();

            configure?.Invoke(options);

            options.AdminConfiguration.BasicConfiguration.BasePath =
                BasePathHelper.Normalize(options.AdminConfiguration.BasicConfiguration.BasePath);

            services.AddSingleton(options);

            services.AddDistributedMemoryCache();
            services.AddOpenIdConnectAccessTokenManagement();

            services.AddRemoteApiProxy(new RemoteApiConfiguration
            {
                Apis = [options.AdminConfiguration.ApiConfiguration.ApiRemoteConfiguration]
            });

            return services;
        }

        /// <summary>
        /// Adds endpoints and fallback logic for Skoruba Admin UI SPA.
        /// </summary>
        public static IApplicationBuilder UseSkorubaAdminUI(this IApplicationBuilder app)
        {
            var options = app.ApplicationServices.GetRequiredService<SkorubaAdminUIOptions>();
            if (app is not WebApplication webApp)
            {
                throw new InvalidOperationException("UseSkorubaAdminUI method must be called on WebApplication.");
            }

            var basePath = BasePathHelper.Normalize(options.AdminConfiguration.BasicConfiguration.BasePath);

            BasePathPipeline.ConfigureBasePath(webApp, basePath);

            webApp.MapSpa(basePath);

            webApp.AddRemoteApisProxy();

            return app;
        }
    }
}
