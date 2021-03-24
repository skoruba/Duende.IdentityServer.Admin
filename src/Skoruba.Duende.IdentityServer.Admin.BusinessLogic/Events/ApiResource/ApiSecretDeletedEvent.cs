// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.ApiResource
{
    public class ApiSecretDeletedEvent : AuditEvent
    {
        public int ApiResourceId { get; set; }

        public int ApiSecretId { get; set; }

        public ApiSecretDeletedEvent(int apiResourceId, int apiSecretId)
        {
            ApiResourceId = apiResourceId;
            ApiSecretId = apiSecretId;
        }
    }
}