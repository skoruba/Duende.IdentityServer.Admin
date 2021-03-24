// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.PersistedGrant
{
    public class PersistedGrantsDeletedEvent : AuditEvent
    {
        public string UserId { get; set; }

        public PersistedGrantsDeletedEvent(string userId)
        {
            UserId = userId;
        }
    }
}