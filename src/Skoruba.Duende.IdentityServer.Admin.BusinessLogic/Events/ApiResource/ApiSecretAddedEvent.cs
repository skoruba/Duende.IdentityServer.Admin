// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.ApiResource
{
    public class ApiSecretAddedEvent : AuditEvent
    {
        public string Type { get; set; }

        public DateTime? Expiration { get; set; }

        public int ApiResourceId { get; set; }

        public ApiSecretAddedEvent(int apiResourceId, string type, DateTime? expiration)
        {
            ApiResourceId = apiResourceId;
            Type = type;
            Expiration = expiration;
        }
    }
}