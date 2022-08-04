using System.Linq;
using Duende.IdentityServer.Hosting.DynamicProviders;
using Duende.IdentityServer.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http;
using Skoruba.Duende.IdentityServer.STS.Identity.Helpers;
using System.Security.Claims;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Services;

public class OpenIdClaimsMappingConfig : ConfigureAuthenticationOptions<OpenIdConnectOptions, OidcProvider>
{
    public OpenIdClaimsMappingConfig(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
    {
    }

    protected override void Configure(ConfigureAuthenticationContext<OpenIdConnectOptions, OidcProvider> context)
    {
        var oidcProvider = context.IdentityProvider;

        var claimMappingName = oidcProvider.Properties
            .SingleOrDefault(x => x.Key == "ClaimActions.NameIdentifier");

        if (!claimMappingName.IsDefault())
        {
            context.AuthenticationOptions.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, claimMappingName.Value);
        }
    }
}