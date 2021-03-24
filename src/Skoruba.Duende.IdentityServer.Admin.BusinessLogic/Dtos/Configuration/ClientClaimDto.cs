// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.ComponentModel.DataAnnotations;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration
{
	public class ClientClaimDto
	{
	    public int Id { get; set; }

	    [Required]
        public string Type { get; set; }

	    [Required]
        public string Value { get; set; }
	}
}