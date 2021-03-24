// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.ComponentModel.DataAnnotations;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Roles
{
    public class RoleClaimApiDto<TKey>
    {
        public int ClaimId { get; set; }

        public TKey RoleId { get; set; }

        [Required]
        public string ClaimType { get; set; }


        [Required]
        public string ClaimValue { get; set; }
    }
}