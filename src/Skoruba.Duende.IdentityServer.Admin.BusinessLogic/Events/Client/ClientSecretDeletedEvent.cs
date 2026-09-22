// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.Client
{
    public class ClientSecretDeletedEvent : AuditEvent
    {
        public int ClientId { get; set; }

        /// <summary>
        /// Name of the owning client at the time of the event, so the audit trail stays
        /// readable without resolving the id (and after the client is renamed or deleted).
        /// </summary>
        public string ClientName { get; set; }

        public int ClientSecretId { get; set; }

        public ClientSecretDeletedEvent(int clientId, string clientName, int clientSecretId)
        {
            ClientId = clientId;
            ClientName = clientName;
            ClientSecretId = clientSecretId;
        }
    }
}