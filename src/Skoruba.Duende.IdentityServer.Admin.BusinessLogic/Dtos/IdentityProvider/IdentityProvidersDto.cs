// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider
{
	public class IdentityProvidersDto
	{
		public IdentityProvidersDto()
		{
            IdentityProviders = new List<IdentityProviderDto>();
		}
		
		public int PageSize { get; set; }

		public int TotalCount { get; set; }

		public List<IdentityProviderDto> IdentityProviders { get; set; }
	}
}