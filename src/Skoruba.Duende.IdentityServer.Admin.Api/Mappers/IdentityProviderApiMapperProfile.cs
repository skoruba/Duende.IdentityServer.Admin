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
using Microsoft.AspNetCore.Mvc.TagHelpers.Cache;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.IdentityProvider;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Mappers
{
    public class IdentityProviderApiMapperProfile : Profile
    {
        public IdentityProviderApiMapperProfile()
        {
            // map to api dto
            CreateMap<IdentityProviderDto, IdentityProviderApiDto>(MemberList.Destination)
                .ForMember(apiDto => apiDto.IdentityProviderProperties,
                    opts => opts.ConvertUsing(PropertiesConverter.Converter, x => x.Properties))
                ;

            // map from api dto
            CreateMap<IdentityProviderApiDto, IdentityProviderDto>(MemberList.Destination)
                .ForMember(dto => dto.Properties,
                    opts => opts.ConvertUsing(PropertiesConverter.Converter, x => x.IdentityProviderProperties));

            CreateMap<IdentityProvidersDto, IdentityProvidersApiDto>(MemberList.Destination)
                .ReverseMap();
        }

        class PropertiesConverter :
            IValueConverter<Dictionary<int, IdentityProviderPropertyDto>, Dictionary<string, string>>,
            IValueConverter<Dictionary<string, string>, Dictionary<int, IdentityProviderPropertyDto>>
        {
            public static PropertiesConverter Converter = new PropertiesConverter();

            public Dictionary<string, string> Convert(Dictionary<int, IdentityProviderPropertyDto> sourceMember, ResolutionContext context)
            {
                var dict = sourceMember.ToDictionary(x => x.Value.Name, dto => dto.Value.Value);
                return dict;
            }

            public Dictionary<int, IdentityProviderPropertyDto> Convert(Dictionary<string, string> sourceMember, ResolutionContext context)
            {
                var index = 0;
                var dict = sourceMember.Select(i => new IdentityProviderPropertyDto { Name = i.Key, Value = i.Value });
                return dict.ToDictionary(_ => index++, item => item);
            }
        }
    }
}