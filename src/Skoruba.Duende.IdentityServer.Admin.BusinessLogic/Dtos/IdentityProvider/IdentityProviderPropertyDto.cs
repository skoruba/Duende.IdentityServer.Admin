// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.ComponentModel.DataAnnotations;
using System.Diagnostics;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider
{
    public class IdentityProviderPropertyDto
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Value { get; set; }
    }
}