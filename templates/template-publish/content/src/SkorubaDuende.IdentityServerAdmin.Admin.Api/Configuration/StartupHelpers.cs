using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using NSwag;
using NSwag.Generation.Processors.Security;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Authorization;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Configuration;

public static class StartupHelpers
{
    public static void AddSwaggerServices(this IServiceCollection services, AdminApiConfiguration adminApiConfiguration)
    {
        services.AddEndpointsApiExplorer();
        services.AddOpenApiDocument(configure =>
        {
            configure.Title = adminApiConfiguration.ApiName;
            configure.Version = adminApiConfiguration.ApiVersion;

            configure.AddSecurity("OAuth2", new OpenApiSecurityScheme
            {
                Type = OpenApiSecuritySchemeType.OAuth2,
                Flows = new OpenApiOAuthFlows
                {
                    AuthorizationCode = new OpenApiOAuthFlow
                    {
                        AuthorizationUrl = $"{adminApiConfiguration.IdentityServerBaseUrl}/connect/authorize",
                        TokenUrl = $"{adminApiConfiguration.IdentityServerBaseUrl}/connect/token",
                        Scopes = new Dictionary<string, string>
                        {
                            { adminApiConfiguration.OidcApiName, adminApiConfiguration.ApiName }
                        }
                    }
                }
            });

            configure.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("OAuth2"));
            configure.OperationProcessors.Add(new AuthorizeCheckOperationProcessor(adminApiConfiguration));
        });
    }
}