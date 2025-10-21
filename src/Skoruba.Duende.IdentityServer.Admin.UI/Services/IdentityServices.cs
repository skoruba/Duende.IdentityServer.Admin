using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.JsonWebTokens;
using Skoruba.Duende.IdentityServer.Admin.UI.Services.AntiForgeryProtection;
using Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;
using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Services;

public static class IdentityServices
{
    public static string? GetUserId(this ClaimsPrincipal claimsPrincipal) => ((ClaimsIdentity)claimsPrincipal.Identity!).FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

    public static string? GetUserEmail(this ClaimsPrincipal claimsPrincipal) => ((ClaimsIdentity)claimsPrincipal.Identity!).FindFirst(JwtRegisteredClaimNames.Email)?.Value;
    
    public static string? GetUserName(this ClaimsPrincipal claimsPrincipal) => ((ClaimsIdentity)claimsPrincipal.Identity!).FindFirst(JwtRegisteredClaimNames.Name)?.Value;
    
    public static void UseAntiForgeryProtection(this WebApplication app)
    {
        app.UseMiddleware<AntiForgeryProtectionMiddleware>();
    }
    
    public static void AddRemoteApiProxy(this IServiceCollection services, RemoteApiConfiguration? config)
    {
        ArgumentNullException.ThrowIfNull(config);

        var routes = new List<RouteConfig>();
        var clusters = new List<ClusterConfig>();

        foreach (var api in config.Apis)
        {
            var route = new RouteConfig
            {
                RouteId = api.ApiName,
                ClusterId = api.ApiName,
                Match = new RouteMatch { Path = $"/{api.ApiName}/{{**catch-all}}" },
                Metadata = new Dictionary<string, string>
                {
                    { nameof(AntiForgeryProtectionAttribute), api.UseCsrfProtection.ToString() },
                }
            };

            route = route.WithTransformPathRemovePrefix(prefix: $"/{api.ApiName}");

            routes.Add(route);

            clusters.Add(new ClusterConfig
            {
                ClusterId = api.ApiName,
                Destinations = new Dictionary<string, DestinationConfig>
                {
                    { api.ApiName, new DestinationConfig { Address = api.RemoteUrl } }
                }
            });
        }

        services.AddReverseProxy().LoadFromMemory(routes, clusters);
    }

    public static void AddRemoteApisProxy(this IEndpointRouteBuilder route)
    {
        route.MapReverseProxy(proxyPipeline =>
        {
            proxyPipeline.Use(async (context, next) =>
            {
                if (VerifyAntiForgeryProtection(context))
                {
                    return;
                }

                var token = await context.GetUserAccessTokenAsync();
                if (!string.IsNullOrEmpty(token.AccessToken))
                {
                    context.Request.Headers.Authorization = $"Bearer {token.AccessToken}";
                }

                await next();
            });
        });
    }

    private static bool VerifyAntiForgeryProtection(HttpContext context)
    {
        var routeModel = context.GetRouteModel();
        var metadata = routeModel.Config.Metadata;

        var requiresCsrf = metadata != null &&
                           metadata.TryGetValue(nameof(AntiForgeryProtectionAttribute), out var value) &&
                           bool.TryParse(value, out var enabled) &&
                           enabled;

        if (!requiresCsrf)
        {
            return false;
        }

        if (context.Request.Headers.TryGetValue(AntiForgeryProtectionConsts.AntiForgeryHeader, out var csrfValue) &&
            csrfValue == AntiForgeryProtectionConsts.AntiForgeryHeaderValue)
        {
            return false;
        }
        
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        
        return true;
    }
}