// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.Client
{
    public class ClientSecretAddedEvent : AuditEvent
    {
        public string Type { get; set; }

        public DateTime? Expiration { get; set; }

        public int ClientId { get; set; }

        /// <summary>
        /// Name of the owning client at the time of the event, so the audit trail stays
        /// readable without resolving the id (and after the client is renamed or deleted).
        /// </summary>
        public string ClientName { get; set; }


        public ClientSecretAddedEvent(int clientId, string clientName, string type, DateTime? expiration)
        {
            ClientId = clientId;
            ClientName = clientName;
            Type = type;
            Expiration = expiration;
        }
    }
}