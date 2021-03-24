// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration
{
    public class ApiResourcePropertiesDto
    {
        public int ApiResourcePropertyId { get; set; }

        public int ApiResourceId { get; set; }

        public string ApiResourceName { get; set; }

        [Required]
        public string Key { get; set; }

        [Required]
        public string Value { get; set; }

        public List<ApiResourcePropertyDto> ApiResourceProperties { get; set; } = new List<ApiResourcePropertyDto>();

        public int TotalCount { get; set; }

        public int PageSize { get; set; }
    }
}
