using Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Identity;
using Skoruba.Duende.IdentityServer.STS.Identity.Configuration.Interfaces;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Configuration
{
    public class RootConfiguration : IRootConfiguration
    {      
        public AdminConfiguration AdminConfiguration { get; } = new AdminConfiguration();
        public RegisterConfiguration RegisterConfiguration { get; } = new RegisterConfiguration();
    }
}