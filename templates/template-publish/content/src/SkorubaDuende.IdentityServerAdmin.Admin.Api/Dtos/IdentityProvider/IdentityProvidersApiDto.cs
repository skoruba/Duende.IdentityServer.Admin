// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Dtos.IdentityProvider
{
	public class IdentityProvidersApiDto
	{
		public IdentityProvidersApiDto()
		{
            IdentityProviders = new List<IdentityProviderApiDto>();
		}
		
		public int PageSize { get; set; }

		public int TotalCount { get; set; }

		public List<IdentityProviderApiDto> IdentityProviders { get; set; }
	}
}







