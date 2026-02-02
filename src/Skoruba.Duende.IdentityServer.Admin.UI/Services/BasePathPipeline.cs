using Microsoft.AspNetCore.Builder;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Services;

internal static class BasePathPipeline
{
    public static void ConfigureBasePath(WebApplication webApp, string basePath)
    {
        if (basePath == "/")
        {
            return;
        }

        webApp.Use(async (context, next) =>
        {
            if (context.Request.Path == "/" || context.Request.Path == string.Empty)
            {
                context.Response.Redirect(basePath);
                return;
            }

            await next();
        });

        var middlewareBasePath = basePath.TrimEnd('/');
        webApp.UsePathBase(middlewareBasePath);

        webApp.Use(async (context, next) =>
        {
            if (context.Request.Path == string.Empty)
            {
                context.Request.Path = "/";
            }

            await next();
        });
    }
}
