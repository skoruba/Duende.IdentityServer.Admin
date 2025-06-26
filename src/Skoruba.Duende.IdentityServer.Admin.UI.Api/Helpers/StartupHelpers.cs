﻿// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Duende.IdentityServer.EntityFramework.Options;
using IdentityModel;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Skoruba.AuditLogging.EntityFramework.DbContexts;
using Skoruba.AuditLogging.EntityFramework.Entities;
using Skoruba.AuditLogging.EntityFramework.Extensions;
using Skoruba.AuditLogging.EntityFramework.Repositories;
using Skoruba.AuditLogging.EntityFramework.Services;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Extensions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Extensions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.MySql;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.PostgreSQL;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.SqlServer;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Helpers;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.Extensions;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.ApplicationParts;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.AuditLogging;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.ExceptionHandling;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Helpers.Localization;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Mappers;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Resources;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Helpers
{
    public static class StartupHelpers
    {
        public static IServiceCollection AddAuditEventLogging<TAuditLoggingDbContext, TAuditLog>(
            this IServiceCollection services, IConfiguration configuration)
            where TAuditLog : AuditLog, new()
            where TAuditLoggingDbContext : IAuditLoggingDbContext<TAuditLog>
        {
            services.AddHttpContextAccessor();

            var auditLoggingConfiguration = configuration.GetSection(nameof(AuditLoggingConfiguration))
                .Get<AuditLoggingConfiguration>();
            services.AddSingleton(auditLoggingConfiguration);

            services.AddAuditLogging(options => { options.Source = auditLoggingConfiguration.Source; })
                .AddEventData<ApiAuditSubject, ApiAuditAction>()
                .AddAuditSinks<DatabaseAuditEventLoggerSink<TAuditLog>>();

            services
                .AddTransient<IAuditLoggingRepository<TAuditLog>,
                    AuditLoggingRepository<TAuditLoggingDbContext, TAuditLog>>();
            
            services.AddTransient<IAuditLogRepository<TAuditLog>, AuditLogRepository<TAuditLoggingDbContext, TAuditLog>>();
            services.AddTransient<IAuditLogService, AuditLogService<TAuditLog>>();

            return services;
        }

        public static IServiceCollection AddAdminApiCors(this IServiceCollection services, AdminApiConfiguration adminApiConfiguration)
        {
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(
                    builder =>
                    {
                        if (adminApiConfiguration.CorsAllowAnyOrigin)
                        {
                            builder.AllowAnyOrigin();
                        }
                        else
                        {
                            builder.WithOrigins(adminApiConfiguration.CorsAllowOrigins);
                        }

                        builder.AllowAnyHeader();
                        builder.AllowAnyMethod();
                    });
            });

            return services;
        }

        /// <summary>
        /// Register services for MVC
        /// </summary>
        /// <param name="services"></param>
        public static void AddMvcServices<TUserDto, TRoleDto,
            TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken,
            TUsersDto, TRolesDto, TUserRolesDto, TUserClaimsDto,
            TUserProviderDto, TUserProvidersDto, TUserChangePasswordDto, TRoleClaimsDto, TUserClaimDto, TRoleClaimDto>(
            this IServiceCollection services)
            where TUserDto : UserDto<TKey>, new()
            where TRoleDto : RoleDto<TKey>, new()
            where TUser : IdentityUser<TKey>
            where TRole : IdentityRole<TKey>
            where TKey : IEquatable<TKey>
            where TUserClaim : IdentityUserClaim<TKey>
            where TUserRole : IdentityUserRole<TKey>
            where TUserLogin : IdentityUserLogin<TKey>
            where TRoleClaim : IdentityRoleClaim<TKey>
            where TUserToken : IdentityUserToken<TKey>
            where TUsersDto : UsersDto<TUserDto, TKey>
            where TRolesDto : RolesDto<TRoleDto, TKey>
            where TUserRolesDto : UserRolesDto<TRoleDto, TKey>
            where TUserClaimsDto : UserClaimsDto<TUserClaimDto, TKey>
            where TUserProviderDto : UserProviderDto<TKey>
            where TUserProvidersDto : UserProvidersDto<TUserProviderDto, TKey>
            where TUserChangePasswordDto : UserChangePasswordDto<TKey>
            where TRoleClaimsDto : RoleClaimsDto<TRoleClaimDto, TKey>
            where TUserClaimDto : UserClaimDto<TKey>
            where TRoleClaimDto : RoleClaimDto<TKey>
        {
            services.AddLocalization(opts => { opts.ResourcesPath = ConfigurationConsts.ResourcesPath; });

            services.TryAddTransient(typeof(IGenericControllerLocalizer<>), typeof(GenericControllerLocalizer<>));

            services.AddControllersWithViews(o => { o.Conventions.Add(new GenericControllerRouteConvention()); })
                .AddDataAnnotationsLocalization()
                .ConfigureApplicationPartManager(m =>
                {
                    m.FeatureProviders.Add(
                        new GenericTypeControllerFeatureProvider<TUserDto, TRoleDto,
                            TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken,
                            TUsersDto, TRolesDto, TUserRolesDto, TUserClaimsDto,
                            TUserProviderDto, TUserProvidersDto, TUserChangePasswordDto, TRoleClaimsDto, TUserClaimDto, TRoleClaimDto>());
                });
        }

        /// <summary>
        /// Register DbContexts for IdentityServer ConfigurationStore and PersistedGrants, Identity and Logging
        /// Configure the connection strings in AppSettings.json
        /// </summary>
        /// <typeparam name="TConfigurationDbContext"></typeparam>
        /// <typeparam name="TPersistedGrantDbContext"></typeparam>
        /// <typeparam name="TLogDbContext"></typeparam>
        /// <typeparam name="TIdentityDbContext"></typeparam>
        /// <typeparam name="TAuditLoggingDbContext"></typeparam>
        /// <typeparam name="TDataProtectionDbContext"></typeparam>
        /// <param name="services"></param>
        /// <param name="configuration"></param>
        public static void AddDbContexts<TIdentityDbContext, TConfigurationDbContext, TPersistedGrantDbContext,
            TLogDbContext, TAuditLoggingDbContext, TDataProtectionDbContext, TAuditLog>(this IServiceCollection services, IConfiguration configuration)
            where TIdentityDbContext : DbContext
            where TPersistedGrantDbContext : DbContext, IAdminPersistedGrantDbContext
            where TConfigurationDbContext : DbContext, IAdminConfigurationDbContext
            where TLogDbContext : DbContext, IAdminLogDbContext
            where TAuditLoggingDbContext : DbContext, IAuditLoggingDbContext<TAuditLog>
            where TDataProtectionDbContext : DbContext, IDataProtectionKeyContext
            where TAuditLog : AuditLog
        {
            var databaseProvider = configuration.GetSection(nameof(DatabaseProviderConfiguration)).Get<DatabaseProviderConfiguration>();
            var databaseMigrations = configuration.GetSection(nameof(DatabaseMigrationsConfiguration)).Get<DatabaseMigrationsConfiguration>() ?? new DatabaseMigrationsConfiguration();
            var connectionStrings = configuration.GetSection("ConnectionStrings").Get<ConnectionStringsConfiguration>();

            switch (databaseProvider.ProviderType)
            {
                case DatabaseProviderType.SqlServer:
                    services.RegisterSqlServerDbContexts<TIdentityDbContext, TConfigurationDbContext, TPersistedGrantDbContext, TLogDbContext, TAuditLoggingDbContext, TDataProtectionDbContext, TAuditLog>(connectionStrings, databaseMigrations);
                    break;
                case DatabaseProviderType.PostgreSQL:
                    services.RegisterNpgSqlDbContexts<TIdentityDbContext, TConfigurationDbContext, TPersistedGrantDbContext, TLogDbContext, TAuditLoggingDbContext, TDataProtectionDbContext, TAuditLog>(connectionStrings, databaseMigrations);
                    break;
                case DatabaseProviderType.MySql:
                    services.RegisterMySqlDbContexts<TIdentityDbContext, TConfigurationDbContext, TPersistedGrantDbContext, TLogDbContext, TAuditLoggingDbContext, TDataProtectionDbContext, TAuditLog>(connectionStrings, databaseMigrations);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(databaseProvider.ProviderType), $@"The value needs to be one of {string.Join(", ", Enum.GetNames(typeof(DatabaseProviderType)))}.");
            }
        }

        /// <summary>
        /// Add authentication middleware for an API
        /// </summary>
        /// <typeparam name="TIdentityDbContext">DbContext for an access to Identity</typeparam>
        /// <typeparam name="TUser">Entity with User</typeparam>
        /// <typeparam name="TRole">Entity with Role</typeparam>
        /// <param name="services"></param>
        /// <param name="configuration"></param>
        public static void AddApiAuthentication<TIdentityDbContext, TUser, TRole>(this IServiceCollection services,
            IConfiguration configuration)
            where TIdentityDbContext : DbContext
            where TRole : class
            where TUser : class
        {
            var adminApiConfiguration = configuration.GetSection(nameof(AdminApiConfiguration)).Get<AdminApiConfiguration>();

            services.AddIdentityCore<TUser>(options => configuration.GetSection(nameof(IdentityOptions)).Bind(options))
                .AddRoles<TRole>()
                .AddEntityFrameworkStores<TIdentityDbContext>()
                .AddDefaultTokenProviders();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
                {
                    options.Authority = adminApiConfiguration.IdentityServerBaseUrl;
                    options.RequireHttpsMetadata = adminApiConfiguration.RequireHttpsMetadata;
                    options.Audience = adminApiConfiguration.OidcApiName;
                });
        }

        /// <summary>
        /// Register in memory DbContexts for IdentityServer ConfigurationStore and PersistedGrants, Identity and Logging
        /// For testing purpose only
        /// </summary>
        /// <typeparam name="TConfigurationDbContext"></typeparam>
        /// <typeparam name="TPersistedGrantDbContext"></typeparam>
        /// <typeparam name="TLogDbContext"></typeparam>
        /// <typeparam name="TIdentityDbContext"></typeparam>
        /// <typeparam name="TAuditLoggingDbContext"></typeparam>
        /// <typeparam name="TDataProtectionDbContext"></typeparam>
        /// <param name="services"></param>
        public static void RegisterDbContextsStaging<TIdentityDbContext, TConfigurationDbContext, TPersistedGrantDbContext, TLogDbContext, TAuditLoggingDbContext, TDataProtectionDbContext>(this IServiceCollection services)
            where TIdentityDbContext : DbContext
            where TPersistedGrantDbContext : DbContext, IAdminPersistedGrantDbContext
            where TConfigurationDbContext : DbContext, IAdminConfigurationDbContext
            where TLogDbContext : DbContext, IAdminLogDbContext
            where TAuditLoggingDbContext : DbContext, IAuditLoggingDbContext<AuditLog>
            where TDataProtectionDbContext : DbContext, IDataProtectionKeyContext
        {
            var persistedGrantsDatabaseName = Guid.NewGuid().ToString();
            var configurationDatabaseName = Guid.NewGuid().ToString();
            var logDatabaseName = Guid.NewGuid().ToString();
            var identityDatabaseName = Guid.NewGuid().ToString();
            var auditLoggingDatabaseName = Guid.NewGuid().ToString();
            var dataProtectionDatabaseName = Guid.NewGuid().ToString();

            var operationalStoreOptions = new OperationalStoreOptions();
            services.AddSingleton(operationalStoreOptions);

            var storeOptions = new ConfigurationStoreOptions();
            services.AddSingleton(storeOptions);

            services.AddDbContext<TIdentityDbContext>(optionsBuilder => optionsBuilder.UseInMemoryDatabase(identityDatabaseName));
            services.AddDbContext<TPersistedGrantDbContext>(optionsBuilder => optionsBuilder.UseInMemoryDatabase(persistedGrantsDatabaseName));
            services.AddDbContext<TConfigurationDbContext>(optionsBuilder => optionsBuilder.UseInMemoryDatabase(configurationDatabaseName));
            services.AddDbContext<TLogDbContext>(optionsBuilder => optionsBuilder.UseInMemoryDatabase(logDatabaseName));
            services.AddDbContext<TAuditLoggingDbContext>(optionsBuilder => optionsBuilder.UseInMemoryDatabase(auditLoggingDatabaseName));
            services.AddDbContext<TDataProtectionDbContext>(optionsBuilder => optionsBuilder.UseInMemoryDatabase(dataProtectionDatabaseName));
        }

        public static void AddAuthorizationPolicies(this IServiceCollection services)
        {
            var adminApiConfiguration = services.BuildServiceProvider().GetService<AdminApiConfiguration>();

            services.AddAuthorization(options =>
            {
                options.AddPolicy(AuthorizationConsts.AdministrationPolicy,
                    policy =>
                        policy.RequireAssertion(context => context.User.HasClaim(c =>
                                ((c.Type == JwtClaimTypes.Role && c.Value == adminApiConfiguration.AdministrationRole) ||
                                 (c.Type == $"client_{JwtClaimTypes.Role}" && c.Value == adminApiConfiguration.AdministrationRole))
                            ) && context.User.HasClaim(c => c.Type == JwtClaimTypes.Scope && c.Value == adminApiConfiguration.OidcApiName)
                        ));
            });
        }

        public static void AddIdSHealthChecks<TConfigurationDbContext, TPersistedGrantDbContext, TIdentityDbContext, TLogDbContext, TAuditLoggingDbContext, TDataProtectionDbContext>(this IServiceCollection services, IConfiguration configuration, AdminApiConfiguration adminApiConfiguration)
            where TConfigurationDbContext : DbContext, IAdminConfigurationDbContext
            where TPersistedGrantDbContext : DbContext, IAdminPersistedGrantDbContext
            where TIdentityDbContext : DbContext
            where TLogDbContext : DbContext, IAdminLogDbContext
            where TAuditLoggingDbContext : DbContext, IAuditLoggingDbContext<AuditLog>
            where TDataProtectionDbContext : DbContext, IDataProtectionKeyContext
        {
            var configurationDbConnectionString = configuration.GetConnectionString(ConfigurationConsts.ConfigurationDbConnectionStringKey);
            var persistedGrantsDbConnectionString = configuration.GetConnectionString(ConfigurationConsts.PersistedGrantDbConnectionStringKey);
            var identityDbConnectionString = configuration.GetConnectionString(ConfigurationConsts.IdentityDbConnectionStringKey);
            var logDbConnectionString = configuration.GetConnectionString(ConfigurationConsts.AdminLogDbConnectionStringKey);
            var auditLogDbConnectionString = configuration.GetConnectionString(ConfigurationConsts.AdminAuditLogDbConnectionStringKey);
            var dataProtectionDbConnectionString = configuration.GetConnectionString(ConfigurationConsts.DataProtectionDbConnectionStringKey);

            var identityServerUri = adminApiConfiguration.IdentityServerBaseUrl;
            var healthChecksBuilder = services.AddHealthChecks()
                .AddDbContextCheck<TConfigurationDbContext>("ConfigurationDbContext")
                .AddDbContextCheck<TPersistedGrantDbContext>("PersistedGrantsDbContext")
                .AddDbContextCheck<TIdentityDbContext>("IdentityDbContext")
                .AddDbContextCheck<TLogDbContext>("LogDbContext")
                .AddDbContextCheck<TAuditLoggingDbContext>("AuditLogDbContext")
                .AddDbContextCheck<TDataProtectionDbContext>("DataProtectionDbContext")
                .AddOpenIdConnectServer(oidcSvrUri: new Uri(identityServerUri), name: "Identity Server");

            var serviceProvider = services.BuildServiceProvider();
            var scopeFactory = serviceProvider.GetRequiredService<IServiceScopeFactory>();
            using (var scope = scopeFactory.CreateScope())
            {
                var configurationTableName = DbContextHelpers.GetEntityTable<TConfigurationDbContext>(scope.ServiceProvider);
                var persistedGrantTableName = DbContextHelpers.GetEntityTable<TPersistedGrantDbContext>(scope.ServiceProvider);
                var identityTableName = DbContextHelpers.GetEntityTable<TIdentityDbContext>(scope.ServiceProvider);
                var logTableName = DbContextHelpers.GetEntityTable<TLogDbContext>(scope.ServiceProvider);
                var auditLogTableName = DbContextHelpers.GetEntityTable<TAuditLoggingDbContext>(scope.ServiceProvider);
                var dataProtectionTableName = DbContextHelpers.GetEntityTable<TDataProtectionDbContext>(scope.ServiceProvider);

                var databaseProvider = configuration.GetSection(nameof(DatabaseProviderConfiguration)).Get<DatabaseProviderConfiguration>();
                switch (databaseProvider.ProviderType)
                {
                    case DatabaseProviderType.SqlServer:
                        const string defaultSchemaName = "dbo";
                        var configurationTableSchema = DbContextHelpers.GetEntityTableSchema<TConfigurationDbContext>(scope.ServiceProvider, systemDefaultSchemaName: defaultSchemaName);
                        var persistedGrantTableSchema = DbContextHelpers.GetEntityTableSchema<TPersistedGrantDbContext>(scope.ServiceProvider, systemDefaultSchemaName: defaultSchemaName);
                        var identityTableSchema = DbContextHelpers.GetEntityTableSchema<TIdentityDbContext>(scope.ServiceProvider, systemDefaultSchemaName: defaultSchemaName);
                        var logTableSchema = DbContextHelpers.GetEntityTableSchema<TLogDbContext>(scope.ServiceProvider, systemDefaultSchemaName: defaultSchemaName);
                        var auditLogTableSchema = DbContextHelpers.GetEntityTableSchema<TAuditLoggingDbContext>(scope.ServiceProvider, systemDefaultSchemaName: defaultSchemaName);
                        var dataProtectionTableSchema = DbContextHelpers.GetEntityTableSchema<TDataProtectionDbContext>(scope.ServiceProvider, systemDefaultSchemaName: defaultSchemaName);
                        healthChecksBuilder
                            .AddSqlServer(configurationDbConnectionString, name: "ConfigurationDb",
                                healthQuery: $"SELECT TOP 1 * FROM [{configurationTableSchema}].[{configurationTableName}]")
                            .AddSqlServer(persistedGrantsDbConnectionString, name: "PersistentGrantsDb",
                                healthQuery: $"SELECT TOP 1 * FROM [{persistedGrantTableSchema}].[{persistedGrantTableName}]")
                            .AddSqlServer(identityDbConnectionString, name: "IdentityDb",
                                healthQuery: $"SELECT TOP 1 * FROM [{identityTableSchema}].[{identityTableName}]")
                            .AddSqlServer(logDbConnectionString, name: "LogDb",
                                healthQuery: $"SELECT TOP 1 * FROM [{logTableSchema}].[{logTableName}]")
                            .AddSqlServer(auditLogDbConnectionString, name: "AuditLogDb",
                                healthQuery: $"SELECT TOP 1 * FROM [{auditLogTableSchema}].[{auditLogTableName}]")
                            .AddSqlServer(dataProtectionDbConnectionString, name: "DataProtectionDb",
                            healthQuery: $"SELECT TOP 1 * FROM [{dataProtectionTableSchema}].[{dataProtectionTableName}]");
                        break;
                    case DatabaseProviderType.PostgreSQL:
                        healthChecksBuilder
                            .AddNpgSql(configurationDbConnectionString, name: "ConfigurationDb",
                                healthQuery: $"SELECT * FROM \"{configurationTableName}\" LIMIT 1")
                            .AddNpgSql(persistedGrantsDbConnectionString, name: "PersistentGrantsDb",
                                healthQuery: $"SELECT * FROM \"{persistedGrantTableName}\" LIMIT 1")
                            .AddNpgSql(identityDbConnectionString, name: "IdentityDb",
                                healthQuery: $"SELECT * FROM \"{identityTableName}\" LIMIT 1")
                            .AddNpgSql(logDbConnectionString, name: "LogDb",
                                healthQuery: $"SELECT * FROM \"{logTableName}\" LIMIT 1")
                            .AddNpgSql(auditLogDbConnectionString, name: "AuditLogDb",
                                healthQuery: $"SELECT * FROM \"{auditLogTableName}\"  LIMIT 1")
                            .AddNpgSql(dataProtectionDbConnectionString, name: "DataProtectionDb",
                                healthQuery: $"SELECT * FROM \"{dataProtectionTableName}\"  LIMIT 1");
                        break;
                    case DatabaseProviderType.MySql:
                        healthChecksBuilder
                            .AddMySql(configurationDbConnectionString, name: "ConfigurationDb")
                            .AddMySql(persistedGrantsDbConnectionString, name: "PersistentGrantsDb")
                            .AddMySql(identityDbConnectionString, name: "IdentityDb")
                            .AddMySql(logDbConnectionString, name: "LogDb")
                            .AddMySql(auditLogDbConnectionString, name: "AuditLogDb")
                            .AddMySql(dataProtectionDbConnectionString, name: "DataProtectionDb");
                        break;
                    default:
                        throw new NotImplementedException($"Health checks not defined for database provider {databaseProvider.ProviderType}");
                }
            }
        }

        public static void AddForwardHeaders(this IApplicationBuilder app)
        {
            var forwardingOptions = new ForwardedHeadersOptions()
            {
                ForwardedHeaders = ForwardedHeaders.All
            };

            forwardingOptions.KnownNetworks.Clear();
            forwardingOptions.KnownProxies.Clear();

            app.UseForwardedHeaders(forwardingOptions);
        }

        public static void AddIdentityServerAdminApi<TIdentityDbContext, TIdentityServerConfigurationDbContext, TPersistedGrantDbContext, TIdentityServerDataProtectionDbContext, TAdminLogDbContext, TAdminAuditLogDbContext, TAuditLog, TUserDto, TRoleDto, TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken,
            TUsersDto, TRolesDto, TUserRolesDto, TUserClaimsDto,
            TUserProviderDto, TUserProvidersDto, TUserChangePasswordDto, TRoleClaimsDto, TUserClaimDto, TRoleClaimDto>(this IServiceCollection services, IConfiguration configuration, AdminApiConfiguration adminApiConfiguration)
            where TPersistedGrantDbContext : DbContext, IAdminPersistedGrantDbContext
            where TIdentityDbContext : IdentityDbContext<TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken>
            where TUserDto : UserDto<TKey>, new()
            where TRoleDto : RoleDto<TKey>, new()
            where TUser : IdentityUser<TKey>
            where TRole : IdentityRole<TKey>
            where TKey : IEquatable<TKey>
            where TUserClaim : IdentityUserClaim<TKey>
            where TUserRole : IdentityUserRole<TKey>
            where TUserLogin : IdentityUserLogin<TKey>
            where TRoleClaim : IdentityRoleClaim<TKey>
            where TUserToken : IdentityUserToken<TKey>
            where TUsersDto : UsersDto<TUserDto, TKey>
            where TRolesDto : RolesDto<TRoleDto, TKey>
            where TUserRolesDto : UserRolesDto<TRoleDto, TKey>
            where TUserClaimsDto : UserClaimsDto<TUserClaimDto, TKey>
            where TUserProviderDto : UserProviderDto<TKey>
            where TUserProvidersDto : UserProvidersDto<TUserProviderDto, TKey>
            where TUserChangePasswordDto : UserChangePasswordDto<TKey>
            where TRoleClaimsDto : RoleClaimsDto<TRoleClaimDto, TKey>
            where TUserClaimDto : UserClaimDto<TKey>
            where TRoleClaimDto : RoleClaimDto<TKey>
            where TIdentityServerDataProtectionDbContext : DbContext, IDataProtectionKeyContext
            where TIdentityServerConfigurationDbContext : DbContext, IAdminConfigurationDbContext
            where TAdminLogDbContext : DbContext, IAdminLogDbContext
            where TAdminAuditLogDbContext : IAuditLoggingDbContext<AuditLog>, IAuditLoggingDbContext<TAuditLog>
            where TAuditLog : AuditLog, new()
        {
            services.AddDataProtection<TIdentityServerDataProtectionDbContext>(configuration);
            
            services.AddScoped<ControllerExceptionFilterAttribute>();
            services.AddScoped<IApiErrorResources, ApiErrorResources>();
            
            var profileTypes = new HashSet<Type>
            {
                typeof(IdentityMapperProfile<TRoleDto, TUserRolesDto, TKey, TUserClaimsDto, TUserClaimDto, TUserProviderDto, TUserProvidersDto, TUserChangePasswordDto, TRoleClaimDto, TRoleClaimsDto>)
            };

            services.AddConfigureAdminAspNetIdentitySchema(configuration);

            services.AddAdminAspNetIdentityServices<TIdentityDbContext, TPersistedGrantDbContext,
                TUserDto, TRoleDto, TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken,
                TUsersDto, TRolesDto, TUserRolesDto, TUserClaimsDto,
                TUserProviderDto, TUserProvidersDto, TUserChangePasswordDto, TRoleClaimsDto, TUserClaimDto, TRoleClaimDto>(profileTypes);

            services.AddAdminServices<TIdentityServerConfigurationDbContext, TPersistedGrantDbContext, TAdminLogDbContext>();

            services.AddAdminApiCors(adminApiConfiguration);

            services.AddMvcServices<TUserDto, TRoleDto, TUser, TRole, TKey, TUserClaim, TUserRole, TUserLogin, TRoleClaim, TUserToken,
                TUsersDto, TRolesDto, TUserRolesDto, TUserClaimsDto,
                TUserProviderDto, TUserProvidersDto, TUserChangePasswordDto, TRoleClaimsDto, TUserClaimDto, TRoleClaimDto>();
            
            services.AddAuditEventLogging<TAdminAuditLogDbContext, TAuditLog>(configuration);
        }
    }
}
