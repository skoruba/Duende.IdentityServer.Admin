// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration
{
    public class ClientCloneDto : ClientDto
    {
        public string ClientIdOriginal { get; set; }

        public string ClientNameOriginal { get; set; }

        public bool CloneClientCorsOrigins { get; set; }

        public bool CloneClientRedirectUris { get; set; }

        public bool CloneClientIdPRestrictions { get; set; }

        public bool CloneClientPostLogoutRedirectUris { get; set; }

        public bool CloneClientGrantTypes { get; set; }

        public bool CloneClientScopes { get; set; }

        public bool CloneClientClaims { get; set; }

        public bool CloneClientProperties { get; set; }
    }
}
