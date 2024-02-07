// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Dtos.ApiResources
{
    public class ApiResourcePropertiesApiDto
    {
        public ApiResourcePropertiesApiDto()
        {
            ApiResourceProperties = new List<ApiResourcePropertyApiDto>();
        }

        public List<ApiResourcePropertyApiDto> ApiResourceProperties { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }
    }
}







