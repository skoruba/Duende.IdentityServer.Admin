using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Services;

public static class StartupServices
{
    public static void UseApplicationSecurityHeaders(this IApplicationBuilder app)
    {
        var policy = new HeaderPolicyCollection()
            .AddDefaultSecurityHeaders()
            .AddContentSecurityPolicy(cspBuilder =>
            {
                cspBuilder.AddDefaultSrc().Self();
                cspBuilder.AddScriptSrc().Self();
                cspBuilder.AddStyleSrc().Self().UnsafeInline();
                cspBuilder.AddFontSrc().Self().Data();
                cspBuilder.AddImgSrc().Self().Data();
                cspBuilder.AddObjectSrc().None();
                cspBuilder.AddFrameAncestors().None();
            });

        app.UseSecurityHeaders(policy);
    }
    
    public static void UseApplicationForwardHeaders(this IApplicationBuilder app)
    {
        var forwardingOptions = new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.All
        };

        forwardingOptions.KnownNetworks.Clear();
        forwardingOptions.KnownProxies.Clear();

        app.UseForwardedHeaders(forwardingOptions);
    }
}