// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.ApiResource
{
    public class ApiSecretDeletedEvent : AuditEvent
    {
        public int ApiResourceId { get; set; }

        /// <summary>
        /// Name of the owning API resource at the time of the event, so the audit trail stays
        /// readable without resolving the id (and after the API resource is renamed or deleted).
        /// </summary>
        public string ApiResourceName { get; set; }

        public int ApiSecretId { get; set; }

        public ApiSecretDeletedEvent(int apiResourceId, string apiResourceName, int apiSecretId)
        {
            ApiResourceId = apiResourceId;
            ApiResourceName = apiResourceName;
            ApiSecretId = apiSecretId;
        }
    }
}