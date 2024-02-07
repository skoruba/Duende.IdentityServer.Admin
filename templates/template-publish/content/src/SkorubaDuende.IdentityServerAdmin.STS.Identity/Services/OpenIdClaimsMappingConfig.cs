using System;
using System.Linq;
using Duende.IdentityServer.Hosting.DynamicProviders;
using Duende.IdentityServer.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http;
using SkorubaDuende.IdentityServerAdmin.STS.Identity.Helpers;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace SkorubaDuende.IdentityServerAdmin.STS.Identity.Services;

public class OpenIdClaimsMappingConfig : ConfigureAuthenticationOptions<OpenIdConnectOptions, OidcProvider>
{
    public OpenIdClaimsMappingConfig(IHttpContextAccessor httpContextAccessor, ILogger<ConfigureAuthenticationOptions<OpenIdConnectOptions, OidcProvider>> logger) : base(httpContextAccessor, logger)
    {
    }
    
    protected override void Configure(ConfigureAuthenticationContext<OpenIdConnectOptions, OidcProvider> context)
    {
        var oidcProvider = context.IdentityProvider;

        context.IdentityProvider.Properties.TryGetValue("MapInboundClaims", out var resultMapInboundClaims);

        var mapInboundClaims = resultMapInboundClaims == null || "true".Equals(resultMapInboundClaims);

        context.AuthenticationOptions.MapInboundClaims = mapInboundClaims;
    }
}







