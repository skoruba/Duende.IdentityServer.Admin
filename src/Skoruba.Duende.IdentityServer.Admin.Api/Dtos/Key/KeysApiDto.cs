// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Key
{
    public class KeysApiDto
    {
        public KeysApiDto()
        {
            Keys = new List<KeyApiDto>();
        }

        public List<KeyApiDto> Keys { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }
    }
}