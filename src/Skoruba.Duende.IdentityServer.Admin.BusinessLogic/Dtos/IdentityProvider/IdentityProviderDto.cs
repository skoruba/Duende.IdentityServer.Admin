// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider
{
    public class IdentityProviderDto
    {
        public IdentityProviderDto()
        {
        }

        [Required]
        public string Type { get; set; } = "oidc";

        public int Id { get; set; }

        [Required]
        public string Scheme { get; set; }

        public string DisplayName { get; set; }

        public bool Enabled { get; set; } = true;

        public Dictionary<int, IdentityProviderPropertyDto> Properties { get; set; } = new();
    }

}