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
using Microsoft.JSInterop.Infrastructure;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers
{
    public class IdentityProviderMapperProfile : Profile
    {
        public IdentityProviderMapperProfile()
        {
            // entity to model
            CreateMap<IdentityProvider, IdentityProviderDto>(MemberList.Destination)
                .ForMember(x => x.Properties,
                    opts => opts.ConvertUsing(PropertiesConverter.Converter, x => x.Properties));

            CreateMap<PagedList<IdentityProvider>, IdentityProvidersDto>(MemberList.Destination)
                .ForMember(x => x.IdentityProviders,
                    opt => opt.MapFrom(src => src.Data));
            
            // model to entity
            CreateMap<IdentityProviderDto, IdentityProvider>(MemberList.Source)
                .ForMember(x => x.Properties, opts => opts.ConvertUsing(PropertiesConverter.Converter, x => x.Properties));
        }

        class PropertiesConverter :
            IValueConverter<Dictionary<int, IdentityProviderPropertyDto>, string>,
            IValueConverter<string, Dictionary<int, IdentityProviderPropertyDto>>
        {
            public static PropertiesConverter Converter = new PropertiesConverter();

            public string Convert(Dictionary<int, IdentityProviderPropertyDto> sourceMember, ResolutionContext context)
            {
                var dict = sourceMember.ToDictionary(x => x.Value.Name, dto => dto.Value.Value);
                return JsonSerializer.Serialize(dict);
            }

            public Dictionary<int, IdentityProviderPropertyDto> Convert(string sourceMember, ResolutionContext context)
            {
                if (string.IsNullOrWhiteSpace(sourceMember))
                {
                    return new Dictionary<int, IdentityProviderPropertyDto>();
                }
                var index = 0;
                var dict = JsonSerializer.Deserialize<Dictionary<string, string>>(sourceMember);
                //.Select(i => new IdentityProviderPropertyDto { Name = i.Key, Value = i.Value })
                return dict
                    .ToDictionary(item => index++,
                        item => new IdentityProviderPropertyDto { Name = item.Key, Value = item.Value });
            }
        }
        
    }
}