using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration;

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
    
    public static void UseApplicationForwardHeaders(this IApplicationBuilder app, IConfiguration configuration)
    {
        var forwardedHeadersConfig = configuration.GetSection("ForwardedHeadersConfiguration")
            .Get<ForwardedHeadersConfiguration>() ?? new ForwardedHeadersConfiguration();

        if (forwardedHeadersConfig.Enabled)
        {
            var forwardingOptions = new ForwardedHeadersOptions()
            {
                ForwardedHeaders = ForwardedHeaders.All,
                ForwardLimit = forwardedHeadersConfig.ForwardLimit
            };

            if (forwardedHeadersConfig.AllowAll)
            {
                // Development mode: allow all proxies and networks (insecure)
                forwardingOptions.KnownNetworks.Clear();
                forwardingOptions.KnownProxies.Clear();
            }
            else
            {
                // Production mode: only trust configured proxies and networks
                if (forwardedHeadersConfig.KnownProxies != null && forwardedHeadersConfig.KnownProxies.Count > 0)
                {
                    forwardingOptions.KnownProxies.Clear();
                    foreach (var proxy in forwardedHeadersConfig.KnownProxies)
                    {
                        if (System.Net.IPAddress.TryParse(proxy, out var ipAddress))
                        {
                            forwardingOptions.KnownProxies.Add(ipAddress);
                        }
                    }
                }

                if (forwardedHeadersConfig.KnownNetworks != null && forwardedHeadersConfig.KnownNetworks.Count > 0)
                {
                    forwardingOptions.KnownNetworks.Clear();
                    foreach (var network in forwardedHeadersConfig.KnownNetworks)
                    {
                        var parts = network.Split('/');
                        if (parts.Length == 2 &&
                            System.Net.IPAddress.TryParse(parts[0], out var prefix) &&
                            int.TryParse(parts[1], out var prefixLength))
                        {
                            forwardingOptions.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(prefix, prefixLength));
                        }
                    }
                }

                // If no proxies or networks configured, don't clear defaults (more secure)
                // This means it will only trust the loopback by default
            }

            app.UseForwardedHeaders(forwardingOptions);
        }
    }
}
