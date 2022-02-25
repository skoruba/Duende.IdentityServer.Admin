// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Resources;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Extensions
{
    public static class AdminServicesExtensions
    {
        public static IServiceCollection AddAdminServices<TAdminDbContext>(
            this IServiceCollection services)
            where TAdminDbContext : DbContext, IAdminPersistedGrantDbContext, IAdminConfigurationDbContext, IAdminLogDbContext
        {

            return services.AddAdminServices<TAdminDbContext, TAdminDbContext, TAdminDbContext>();
        }

        public static IServiceCollection AddAdminServices<TConfigurationDbContext, TPersistedGrantDbContext, TLogDbContext>(this IServiceCollection services)
            where TPersistedGrantDbContext : DbContext, IAdminPersistedGrantDbContext
            where TConfigurationDbContext : DbContext, IAdminConfigurationDbContext
            where TLogDbContext : DbContext, IAdminLogDbContext
        {
            //Repositories
            services.AddTransient<IClientRepository, ClientRepository<TConfigurationDbContext>>();
            services.AddTransient<IIdentityResourceRepository, IdentityResourceRepository<TConfigurationDbContext>>();
            services.AddTransient<IApiResourceRepository, ApiResourceRepository<TConfigurationDbContext>>();
            services.AddTransient<IApiScopeRepository, ApiScopeRepository<TConfigurationDbContext>>();
            services.AddTransient<IPersistedGrantRepository, PersistedGrantRepository<TPersistedGrantDbContext>>();
            services.AddTransient<IIdentityProviderRepository, IdentityProviderRepository<TConfigurationDbContext>>();
            services.AddTransient<IKeyRepository, KeyRepository<TPersistedGrantDbContext>>();
            services.AddTransient<ILogRepository, LogRepository<TLogDbContext>>();

            //Services
            services.AddTransient<IClientService, ClientService>();
            services.AddTransient<IApiResourceService, ApiResourceService>();
            services.AddTransient<IApiScopeService, ApiScopeService>();
            services.AddTransient<IIdentityResourceService, IdentityResourceService>();
            services.AddTransient<IIdentityProviderService, IdentityProviderService>();
            services.AddTransient<IPersistedGrantService, PersistedGrantService>();
            services.AddTransient<IKeyService, KeyService>();
            services.AddTransient<ILogService, LogService>();

            //Resources
            services.AddScoped<IApiResourceServiceResources, ApiResourceServiceResources>();
            services.AddScoped<IApiScopeServiceResources, ApiScopeServiceResources>();
            services.AddScoped<IClientServiceResources, ClientServiceResources>();
            services.AddScoped<IIdentityResourceServiceResources, IdentityResourceServiceResources>();
            services.AddScoped<IIdentityProviderServiceResources, IdentityProviderServiceResources>();
            services.AddScoped<IPersistedGrantServiceResources, PersistedGrantServiceResources>();
            services.AddScoped<IKeyServiceResources, KeyServiceResources>();

            return services;
        }
    }
}
