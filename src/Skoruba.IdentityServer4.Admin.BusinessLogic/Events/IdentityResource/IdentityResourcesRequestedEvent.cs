using Skoruba.AuditLogging.Events;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.IdentityResource
{
    public class IdentityResourcesRequestedEvent : AuditEvent
    {
        public IdentityResourcesDto IdentityResources { get; }

        public IdentityResourcesRequestedEvent(IdentityResourcesDto identityResources)
        {
            IdentityResources = identityResources;
        }
    }
}