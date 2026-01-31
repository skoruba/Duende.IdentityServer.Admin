using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Skoruba.Duende.IdentityServer.Admin.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.PostgreSQL;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.SqlServer;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.Services;

public static class StartupService
{
    public static void AddDataProtectionDbContext(this IServiceCollection services, IConfiguration configuration)
    {
        var databaseProviderConfiguration = configuration.GetSection(nameof(DatabaseProviderConfiguration)).Get<DatabaseProviderConfiguration>();
        var databaseMigration = StartupHelpers.GetDatabaseMigrationsConfiguration(configuration, MigrationAssemblyConfiguration.GetMigrationAssemblyByProvider(databaseProviderConfiguration!));
        
        services.AddDataProtectionDbContext<IdentityServerDataProtectionDbContext>(configuration, databaseMigration);
        services.AddDataProtection<IdentityServerDataProtectionDbContext>(configuration);
    }

    private static void AddDataProtectionDbContext<TDataProtectionDbContext>(
        this IServiceCollection services,
        IConfiguration configuration,
        DatabaseMigrationsConfiguration databaseMigrations)
        where TDataProtectionDbContext : DbContext, IDataProtectionKeyContext
    {
        var databaseProvider = configuration.GetSection(nameof(DatabaseProviderConfiguration))
            .Get<DatabaseProviderConfiguration>();
        
        var connectionStrings = configuration.GetSection("ConnectionStrings")
            .Get<ConnectionStringsConfiguration>();

        if (databaseProvider == null)
        {
            throw new ArgumentNullException(nameof(databaseProvider), "Database provider configuration is missing.");
        }
        
        if (connectionStrings == null)
        {
            throw new ArgumentNullException(nameof(connectionStrings), "Connection strings configuration is missing.");
        }
        
        switch (databaseProvider.ProviderType)
        {
            case DatabaseProviderType.SqlServer:
                services.AddDataProtectionDbContextSqlServer<TDataProtectionDbContext>(
                    connectionStrings.DataProtectionDbConnection,
                    databaseMigrations.DataProtectionDbMigrationsAssembly);
                break;
            case DatabaseProviderType.PostgreSQL:
                services.AddDataProtectionDbContextNpgSql<TDataProtectionDbContext>(
                    connectionStrings.DataProtectionDbConnection,
                    databaseMigrations.DataProtectionDbMigrationsAssembly);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(databaseProvider.ProviderType),
                    $@"The value needs to be one of {string.Join(", ", Enum.GetNames<DatabaseProviderType>())}.");
        }
    }
    
    public static void AddSerilog(this WebApplicationBuilder builder)
    {
        builder.Configuration.AddJsonFile("serilog.json", optional: true, reloadOnChange: true);
        
        builder.Host.UseSerilog((context, configuration) =>
            configuration.ReadFrom.Configuration(context.Configuration));
    }

    public static void AddAntiForgeryProtection(this IServiceCollection services)
    {
        services.AddAntiforgery(o =>
        {
            o.Cookie.Name = "__Host-SkorubaBFF-CSRF";
            o.Cookie.HttpOnly = true;
            o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            o.Cookie.SameSite = SameSiteMode.Strict;
        });
    }
    
    public static void AddAuthenticationConfiguration(this IServiceCollection services, IConfiguration configuration)
    {
        var adminConfiguration = configuration.GetSection(nameof(AdminConfiguration)).Get<AdminConfiguration>();
        ArgumentNullException.ThrowIfNull(adminConfiguration);
        
        services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
            {
                options.Cookie.SameSite = SameSiteMode.Strict;
                options.Cookie.Path = "/";
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;

                    return context.Response.CompleteAsync();
                };
            })
            .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
            {
                options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.Authority = adminConfiguration.AuthenticationConfiguration.Authority;
                options.ClientId = adminConfiguration.AuthenticationConfiguration.ClientId;
                options.ResponseType = "code";

                options.UsePkce = true;
                
                adminConfiguration.AuthenticationConfiguration.AdminScopes.ForEach(scope =>
                {
                    options.Scope.Add(scope);
                });
        
                options.SaveTokens = true;
                options.ClientSecret = adminConfiguration.AuthenticationConfiguration.ClientSecret;
                options.GetClaimsFromUserInfoEndpoint = true;
                
                options.PushedAuthorizationBehavior = PushedAuthorizationBehavior.UseIfAvailable;
            });
    }
}
