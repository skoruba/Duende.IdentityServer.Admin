// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Users
{
    public class UserClaimsApiDto<TKey>
    {
        public UserClaimsApiDto()
        {
            Claims = new List<UserClaimApiDto<TKey>>();
        }

        public List<UserClaimApiDto<TKey>> Claims { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }
    }
}