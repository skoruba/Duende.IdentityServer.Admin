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

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers
{
    public class IdentityProviderMapperProfile : Profile
    {
        public IdentityProviderMapperProfile()
        {
            // entity to model
            CreateMap<IdentityProvider, IdentityProviderDto>(MemberList.Destination)
                .ForMember(x => x.IdentityProviderProperties,
                    opts => opts.ConvertUsing(PropertiesConverter.Converter, x => x.Properties));

            CreateMap<PagedList<IdentityProvider>, IdentityProvidersDto>(MemberList.Destination)
                .ForMember(x => x.IdentityProviders,
                    opt => opt.MapFrom(src => src.Data));
            
            // model to entity
            CreateMap<IdentityProviderDto, IdentityProvider>(MemberList.Source)
                .ForMember(x => x.Properties, opts => opts.ConvertUsing(PropertiesConverter.Converter, x => x.IdentityProviderProperties));
        }

        class PropertiesConverter :
            IValueConverter<Dictionary<string, string>, string>,
            IValueConverter<string, Dictionary<string, string>>
        {
            public static PropertiesConverter Converter = new PropertiesConverter();

            public string Convert(Dictionary<string, string> sourceMember, ResolutionContext context)
            {
                return JsonSerializer.Serialize(sourceMember);
            }

            public Dictionary<string, string> Convert(string sourceMember, ResolutionContext context)
            {
                if (string.IsNullOrWhiteSpace(sourceMember))
                {
                    return new Dictionary<string, string>();
                }
                return JsonSerializer.Deserialize<Dictionary<string, string>>(sourceMember);
            }
        }
        
    }
}