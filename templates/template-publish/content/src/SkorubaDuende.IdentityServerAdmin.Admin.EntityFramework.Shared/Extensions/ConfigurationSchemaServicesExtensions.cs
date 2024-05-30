using System;
using Microsoft.Extensions.DependencyInjection;
using SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.Configuration.Schema;

namespace SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.Extensions
{
    public static class ConfigurationSchemaServicesExtensions
    {
        public static IServiceCollection ConfigureAdminAspNetIdentitySchema(this IServiceCollection services,
            Action<AdminIdentityDbSchemaConfiguration> configureOptions)
        {
            if (configureOptions == null)
            {
                throw new ArgumentNullException(nameof(configureOptions));
            }

            var adminIdentitySchema = new AdminIdentityDbSchemaConfiguration();
            configureOptions(adminIdentitySchema);

            services.AddSingleton(adminIdentitySchema);

            return services;
        }
    }
}







