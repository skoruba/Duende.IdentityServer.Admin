// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Dtos.PersistedGrants
{
    public class PersistedGrantsApiDto
    {
        public PersistedGrantsApiDto()
        {
            PersistedGrants = new List<PersistedGrantApiDto>();
        }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }

        public List<PersistedGrantApiDto> PersistedGrants { get; set; }
    }
}







