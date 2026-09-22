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

        /// <summary>
        /// Name of the owning API resource at the time of the event, so the audit trail stays
        /// readable without resolving the id (and after the API resource is renamed or deleted).
        /// </summary>
        public string ApiResourceName { get; set; }

        public ApiSecretAddedEvent(int apiResourceId, string apiResourceName, string type, DateTime? expiration)
        {
            ApiResourceId = apiResourceId;
            ApiResourceName = apiResourceName;
            Type = type;
            Expiration = expiration;
        }
    }
}