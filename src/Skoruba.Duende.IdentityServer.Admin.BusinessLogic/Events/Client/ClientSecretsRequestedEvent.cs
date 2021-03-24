// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Skoruba.AuditLogging.Events;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.Client
{
    public class ClientSecretsRequestedEvent : AuditEvent
    {
        public int ClientId { get; set; }

        public List<(int clientSecretId, string type, DateTime? expiration)> Secrets { get; set; }

        public ClientSecretsRequestedEvent(int clientId, List<(int clientSecretId, string type, DateTime? expiration)> secrets)
        {
            ClientId = clientId;
            Secrets = secrets;
        }
    }
}