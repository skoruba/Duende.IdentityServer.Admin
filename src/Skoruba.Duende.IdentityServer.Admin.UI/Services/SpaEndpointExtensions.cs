using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Services;

public static class SpaEndpointExtensions
{
    private static async Task ServeSpaIndexHtml(HttpContext context, string basePath, string title)
    {
        var env = context.RequestServices.GetRequiredService<IWebHostEnvironment>();
        var fileProvider = env.WebRootFileProvider;

        var fileInfo = fileProvider.GetFileInfo("index.html");
        if (!fileInfo.Exists)
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsync("index.html not found.");
            return;
        }

        using var stream = fileInfo.CreateReadStream();
        using var reader = new StreamReader(stream);
        var html = await reader.ReadToEndAsync();

        html = Regex.Replace(
            html,
            @"<base href=[""'][^""']*[""'] id=[""']dynamic-base[""']\s*/?>",
            $"<base href=\"{basePath}\" id=\"dynamic-base\" />",
            RegexOptions.IgnoreCase
        );

        html = html.Replace("<!--TITLE-->", $"<title>{title}</title>");

        context.Response.ContentType = "text/html";
        await context.Response.WriteAsync(html);
    }

    public static void MapSpa(this IEndpointRouteBuilder endpoints,
        string basePath,
        string title)
    {
        if (basePath == "/")
        {
            endpoints.MapFallback(async context => {
                await ServeSpaIndexHtml(context, basePath, title);
            });
        }
        else
        {
            endpoints.MapGet($"{basePath}index.html", async context =>
            {
                await ServeSpaIndexHtml(context, basePath, title);
            });

            endpoints.MapFallback($"{basePath}{{**rest}}", async context =>
            {
                await ServeSpaIndexHtml(context, basePath, title);
            });
        }
    }
}