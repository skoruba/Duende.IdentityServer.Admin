// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Grant
{
    public class KeysDto
    {
		public KeysDto()
        {
            Keys = new List<KeyDto>();
        }

        public List<KeyDto> Keys { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }
	}
}