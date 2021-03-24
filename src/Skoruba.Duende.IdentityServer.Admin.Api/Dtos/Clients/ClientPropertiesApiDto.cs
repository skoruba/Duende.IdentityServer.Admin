// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Clients
{
    public class ClientPropertiesApiDto
    {
        public ClientPropertiesApiDto()
        {
            ClientProperties = new List<ClientPropertyApiDto>();
        }

        public List<ClientPropertyApiDto> ClientProperties { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }
    }
}