using Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Identity;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Configuration.Interfaces
{
    public interface IRootConfiguration
    {
        AdminConfiguration AdminConfiguration { get; }

        RegisterConfiguration RegisterConfiguration { get; }
    }
}