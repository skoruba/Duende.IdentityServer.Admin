using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Events.Identity
{
    public class RoleUpdatedEvent<TRoleDto> : AuditEvent
    {
        public TRoleDto OriginalRole { get; set; }
        public TRoleDto Role { get; set; }

        public RoleUpdatedEvent(TRoleDto originalRole, TRoleDto role)
        {
            OriginalRole = originalRole;
            Role = role;
        }
    }
}