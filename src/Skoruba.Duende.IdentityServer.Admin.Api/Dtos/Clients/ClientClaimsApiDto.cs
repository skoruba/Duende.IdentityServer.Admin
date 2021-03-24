// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Clients
{
    public class ClientClaimsApiDto
    {
        public ClientClaimsApiDto()
        {
            ClientClaims = new List<ClientClaimApiDto>();
        }

        public List<ClientClaimApiDto> ClientClaims { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }
    }
}