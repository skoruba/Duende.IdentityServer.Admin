// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.Log
{
    public class LogsDeletedEvent : AuditEvent
    {
        public DateTime DeleteOlderThan { get; set; }

        public LogsDeletedEvent(DateTime deleteOlderThan)
        {
            DeleteOlderThan = deleteOlderThan;
        }
    }
}