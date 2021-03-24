// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.IdentityResources
{
    public class IdentityResourcePropertiesApiDto
    {
        public IdentityResourcePropertiesApiDto()
        {
            IdentityResourceProperties = new List<IdentityResourcePropertyApiDto>();
        }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }

        public List<IdentityResourcePropertyApiDto> IdentityResourceProperties { get; set; }
    }
}