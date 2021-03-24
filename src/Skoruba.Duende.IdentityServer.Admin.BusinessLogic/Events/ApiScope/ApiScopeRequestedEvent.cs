// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.AuditLogging.Events;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.ApiScope
{
    public class ApiScopeRequestedEvent : AuditEvent
    {
        public ApiScopeDto ApiScopes { get; set; }

        public ApiScopeRequestedEvent(ApiScopeDto apiScopes)
        {
            ApiScopes = apiScopes;
        }
    }
}