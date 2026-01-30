namespace Skoruba.Duende.IdentityServer.Admin.UI.Services;

internal static class BasePathHelper
{
    public static string Normalize(string? basePath)
    {
        if (string.IsNullOrWhiteSpace(basePath) || basePath == "/")
        {
            return "/";
        }

        basePath = basePath.Trim();

        if (!basePath.StartsWith('/'))
        {
            basePath = "/" + basePath;
        }

        if (!basePath.EndsWith('/'))
        {
            basePath += "/";
        }

        basePath = basePath.Replace("//", "/");

        return basePath;
    }
}
