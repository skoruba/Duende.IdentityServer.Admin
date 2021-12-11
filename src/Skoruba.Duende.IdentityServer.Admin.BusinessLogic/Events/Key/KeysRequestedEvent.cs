using Skoruba.AuditLogging.Events;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Grant;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Key;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.Key
{
    public class KeysRequestedEvent : AuditEvent
    {
        public KeysDto Keys { get; set; }

        public KeysRequestedEvent(KeysDto keys)
        {
            Keys = keys;
        }
    }
}