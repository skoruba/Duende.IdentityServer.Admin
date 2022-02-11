// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider
{
    public class IdentityProviderPropertiesDto
    {
        public IdentityProviderPropertiesDto()
        {
            IdentityProviderProperties = new List<IdentityProviderPropertyDto>();
        }

        public int IdentityProviderId { get; set; }

        public string IdentityProviderScheme { get; set; }

        [Required]
        public string Key { get; set; }

        [Required]
        public string Value { get; set; }

        public List<IdentityProviderPropertyDto> IdentityProviderProperties { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }        
    }
}
