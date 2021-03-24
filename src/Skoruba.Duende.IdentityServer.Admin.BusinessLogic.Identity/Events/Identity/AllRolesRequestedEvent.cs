// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Events.Identity
{
    public class AllRolesRequestedEvent<TRoleDto> : AuditEvent
    {
        public List<TRoleDto> Roles { get; set; }

        public AllRolesRequestedEvent(List<TRoleDto> roles)
        {
            Roles = roles;
        }
    }
}