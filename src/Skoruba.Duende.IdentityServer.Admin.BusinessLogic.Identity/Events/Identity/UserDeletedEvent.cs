// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Events.Identity
{
    public class UserDeletedEvent<TUserDto> : AuditEvent
    {
        public TUserDto User { get; set; }

        public UserDeletedEvent(TUserDto user)
        {
            User = user;
        }
    }
}