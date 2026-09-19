// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.ApiResources
{
    public class ApiSecretApiDto : IValidatableObject
    {
        [Required]
        public string Type { get; set; } = "SharedSecret";

        public int Id { get; set; }

        public string Description { get; set; }

        [Required]
        public string Value { get; set; }

        public string HashType { get; set; }

        public DateTime? Expiration { get; set; }
        
        public DateTime Created { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            return JwkSecretValidator.Validate(Type, Value, nameof(Value));
        }
    }
}