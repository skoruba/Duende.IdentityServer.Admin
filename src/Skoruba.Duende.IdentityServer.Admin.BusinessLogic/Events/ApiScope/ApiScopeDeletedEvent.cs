using Skoruba.AuditLogging.Events;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.ApiScope
{
    public class ApiScopeDeletedEvent : AuditEvent
    {
        public ApiScopeDto ApiScope { get; set; }

        public ApiScopeDeletedEvent(ApiScopeDto apiScope)
        {
            ApiScope = apiScope;
        }
    }
}