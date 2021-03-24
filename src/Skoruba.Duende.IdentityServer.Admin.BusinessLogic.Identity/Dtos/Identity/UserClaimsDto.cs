// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity
{
    public class UserClaimsDto<TUserClaimDto, TKey> : UserClaimDto<TKey>, IUserClaimsDto
       where TUserClaimDto : UserClaimDto<TKey>
    {
        public UserClaimsDto()
        {
            Claims = new List<TUserClaimDto>();
        }

        public string UserName { get; set; }

        public List<TUserClaimDto> Claims { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }

        List<IUserClaimDto> IUserClaimsDto.Claims => Claims.Cast<IUserClaimDto>().ToList();
    }
}
