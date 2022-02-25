// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.ComponentModel.DataAnnotations;
using System.Diagnostics;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider
{
    [DebuggerDisplay("{" + nameof(DebuggerDisplay) + ",nq}")]
    public class IdentityProviderPropertyDto
    {
        private string DebuggerDisplay => $"{Name} = {Value}";

        [Required]
        public string Name { get; set; }

        public string Value { get; set; } = "";
    }
}