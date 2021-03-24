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

        public ClientSecretAddedEvent(int clientId, string type, DateTime? expiration)
        {
            ClientId = clientId;
            Type = type;
            Expiration = expiration;
        }
    }
}