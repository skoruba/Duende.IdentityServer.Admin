// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using AutoMapper;
using SkorubaDuende.IdentityServerAdmin.Admin.Api.Dtos.Clients;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Mappers
{
    public class ClientApiMapperProfile : Profile
    {
        public ClientApiMapperProfile()
        {
            // Client
            CreateMap<ClientDto, ClientApiDto>(MemberList.Destination)
                .ForMember(dest => dest.ProtocolType, opt => opt.Condition(srs => srs != null))
                .ReverseMap();

            CreateMap<ClientsDto, ClientsApiDto>(MemberList.Destination)
                .ReverseMap();

            CreateMap<ClientCloneApiDto, ClientCloneDto>(MemberList.Destination)
                .ReverseMap();

            // Client Secrets
            CreateMap<ClientSecretsDto, ClientSecretApiDto>(MemberList.Destination)
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ClientSecretId))
                .ReverseMap();

            CreateMap<ClientSecretDto, ClientSecretApiDto>(MemberList.Destination)
                .ReverseMap();

            CreateMap<ClientSecretsDto, ClientSecretsApiDto>(MemberList.Destination);

            // Client Properties
            CreateMap<ClientPropertiesDto, ClientPropertyApiDto>(MemberList.Destination)
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ClientPropertyId))
                .ReverseMap();

            CreateMap<ClientPropertyDto, ClientPropertyApiDto>(MemberList.Destination)
                .ReverseMap();

            CreateMap<ClientPropertiesDto, ClientPropertiesApiDto>(MemberList.Destination);

            // Client Claims
            CreateMap<ClientClaimsDto, ClientClaimApiDto>(MemberList.Destination)
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ClientClaimId))
                .ReverseMap();

            CreateMap<ClientClaimDto, ClientClaimApiDto>(MemberList.Destination)
                .ReverseMap();
            CreateMap<ClientClaimsDto, ClientClaimsApiDto>(MemberList.Destination);
        }
    }
}







