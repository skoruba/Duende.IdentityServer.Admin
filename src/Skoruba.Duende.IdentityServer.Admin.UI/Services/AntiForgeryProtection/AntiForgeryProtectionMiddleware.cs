using Microsoft.AspNetCore.Http;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.AntiForgeryProtection;

public class AntiForgeryProtectionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var endpoint = context.GetEndpoint();

        if (endpoint != null)
        {
            var hasAntiForgery = endpoint.Metadata.GetMetadata<AntiForgeryProtectionAttribute>() != null;

            if (hasAntiForgery)
            {
                if (!context.Request.Headers.TryGetValue(AntiForgeryProtectionConsts.AntiForgeryHeader, out var headerValue) || headerValue != AntiForgeryProtectionConsts.AntiForgeryHeaderValue)
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    
                    return;
                }
            }
        }

        await next(context);
    }
}
