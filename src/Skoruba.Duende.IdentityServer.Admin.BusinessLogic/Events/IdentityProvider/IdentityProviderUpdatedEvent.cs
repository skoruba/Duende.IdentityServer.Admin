// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.AuditLogging.Events;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.IdentityProvider
{
    public class IdentityProviderUpdatedEvent : AuditEvent
    {
        public IdentityProviderDto OriginalIdentityProvider { get; set; }
        public IdentityProviderDto IdentityProvider { get; set; }

        public IdentityProviderUpdatedEvent(IdentityProviderDto originalIdentityProvider, IdentityProviderDto identityProvider)
        {
            OriginalIdentityProvider = originalIdentityProvider;
            IdentityProvider = identityProvider;
        }
    }
}