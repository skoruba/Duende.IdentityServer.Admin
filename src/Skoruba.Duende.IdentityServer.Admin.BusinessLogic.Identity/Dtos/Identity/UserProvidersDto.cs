// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity
{
    public class UserProvidersDto<TUserProviderDto, TKey> : UserProviderDto<TKey>, IUserProvidersDto
        where TUserProviderDto : UserProviderDto<TKey>
    {
        public UserProvidersDto()
        {
            Providers = new List<TUserProviderDto>();
        }

        public List<TUserProviderDto> Providers { get; set; }

        List<IUserProviderDto> IUserProvidersDto.Providers => Providers.Cast<IUserProviderDto>().ToList();
    }
}
