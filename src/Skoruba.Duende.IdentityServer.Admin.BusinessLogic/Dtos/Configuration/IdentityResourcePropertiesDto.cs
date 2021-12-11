// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration
{
    public class IdentityResourcePropertiesDto
    {
        public int IdentityResourcePropertyId { get; set; }

        public int IdentityResourceId { get; set; }

        public string IdentityResourceName { get; set; }

        [Required]
        public string Key { get; set; }

        [Required]
        public string Value { get; set; }
        
        public int TotalCount { get; set; }

        public int PageSize { get; set; }

        public List<IdentityResourcePropertyDto> IdentityResourceProperties { get; set; } = new();
    }
}
