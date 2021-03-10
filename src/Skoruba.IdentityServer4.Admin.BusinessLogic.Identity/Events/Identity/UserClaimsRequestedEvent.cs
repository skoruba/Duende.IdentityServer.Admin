using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Events.Identity
{
    public class UserClaimsRequestedEvent<TUserClaimsDto> : AuditEvent
    {
        public TUserClaimsDto Claims { get; set; }

        public UserClaimsRequestedEvent(TUserClaimsDto claims)
        {
            Claims = claims;
        }
    }
}