using Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Identity;
using SkorubaDuende.IdentityServerAdmin.STS.Identity.Configuration.Interfaces;

namespace SkorubaDuende.IdentityServerAdmin.STS.Identity.Configuration
{
    public class RootConfiguration : IRootConfiguration
    {      
        public AdminConfiguration AdminConfiguration { get; } = new AdminConfiguration();
        public RegisterConfiguration RegisterConfiguration { get; } = new RegisterConfiguration();
    }
}







