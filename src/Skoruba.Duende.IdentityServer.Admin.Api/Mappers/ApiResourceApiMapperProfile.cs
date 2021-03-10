using AutoMapper;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.ApiResources;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Mappers
{
    public class ApiResourceApiMapperProfile : Profile
    {
        public ApiResourceApiMapperProfile()
        {
            // Api Resources
            CreateMap<ApiResourcesDto, ApiResourcesApiDto>(MemberList.Destination)
                .ReverseMap();

            CreateMap<ApiResourceDto, ApiResourceApiDto>(MemberList.Destination)
                .ReverseMap();

            // Api Secrets
            CreateMap<ApiSecretsDto, ApiSecretApiDto>(MemberList.Destination)
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ApiSecretId))
                .ReverseMap();

            CreateMap<ApiSecretDto, ApiSecretApiDto>(MemberList.Destination);
            CreateMap<ApiSecretsDto, ApiSecretsApiDto>(MemberList.Destination);

            // Api Properties
            CreateMap<ApiResourcePropertiesDto, ApiResourcePropertyApiDto>(MemberList.Destination)
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ApiResourcePropertyId))
                .ReverseMap();

            CreateMap<ApiResourcePropertyDto, ApiResourcePropertyApiDto>(MemberList.Destination);
            CreateMap<ApiResourcePropertiesDto, ApiResourcePropertiesApiDto>(MemberList.Destination);
        }
    }
}