using Skoruba.AuditLogging.Events;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.IdentityProvider
{
    public class IdentityProvidersRequestedEvent : AuditEvent
    {
        public IdentityProvidersDto IdentityProviders { get; set; }

        public IdentityProvidersRequestedEvent(IdentityProvidersDto identityProviders)
        {
            IdentityProviders = identityProviders;
        }
    }
}