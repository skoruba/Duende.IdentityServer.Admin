using Skoruba.AuditLogging.Events;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.Client
{
    public class ClientClaimDeletedEvent : AuditEvent
    {
        public ClientClaimsDto ClientClaim { get; set; }

        public ClientClaimDeletedEvent(ClientClaimsDto clientClaim)
        {
            ClientClaim = clientClaim;
        }
    }
}