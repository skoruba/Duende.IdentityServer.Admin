// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Events.Identity
{
    public class RoleClaimRequestedEvent<TRoleClaimsDto> : AuditEvent
    {
        public TRoleClaimsDto RoleClaim { get; set; }

        public RoleClaimRequestedEvent(TRoleClaimsDto roleClaim)
        {
            RoleClaim = roleClaim;
        }
    }
}