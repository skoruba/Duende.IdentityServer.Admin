// Based on the IdentityServer4.EntityFramework - authors - Brock Allen & Dominick Baier.
// https://github.com/IdentityServer/IdentityServer4.EntityFramework

// Modified by Jan Škoruba

using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Duende.IdentityServer.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Common;
using System.Text.Json;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.IdentityProvider;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Mappers
{
    public class IdentityProviderApiMapperProfile : Profile
    {
        public IdentityProviderApiMapperProfile()
        {
            // entity to model
            CreateMap<IdentityProviderDto, IdentityProviderApiDto>(MemberList.Destination)
                .ReverseMap();

            CreateMap<IdentityProvidersDto, IdentityProvidersApiDto>(MemberList.Destination)
                .ReverseMap();
        }
        
    }
}