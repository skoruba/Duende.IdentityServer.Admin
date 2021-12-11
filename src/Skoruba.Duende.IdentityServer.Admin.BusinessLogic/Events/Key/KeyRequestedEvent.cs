using Skoruba.AuditLogging.Events;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Grant;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Key;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.Key
{
    public class KeyRequestedEvent : AuditEvent
    {
        public KeyDto Key { get; set; }

        public KeyRequestedEvent(KeyDto key)
        {
            Key = key;
        }
    }
}