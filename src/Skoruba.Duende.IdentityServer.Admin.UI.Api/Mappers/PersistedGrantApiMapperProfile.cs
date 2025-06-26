// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using AutoMapper;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Grant;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.PersistedGrants;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Mappers
{
    public class PersistedGrantApiMapperProfile : Profile
    {
        public PersistedGrantApiMapperProfile()
        {
            CreateMap<PersistedGrantDto, PersistedGrantApiDto>(MemberList.Destination);
            CreateMap<PersistedGrantDto, PersistedGrantSubjectApiDto>(MemberList.Destination);
            CreateMap<PersistedGrantsDto, PersistedGrantSubjectsApiDto>(MemberList.Destination);
            CreateMap<PersistedGrantsDto, PersistedGrantsApiDto>(MemberList.Destination);
            
            CreateMap<Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Grant.PersistedGrantDto, PersistedGrantApiDto>(MemberList.Destination);
            CreateMap<Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Grant.PersistedGrantDto, PersistedGrantSubjectApiDto>(MemberList.Destination);
            CreateMap<Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Grant.PersistedGrantsDto, PersistedGrantSubjectsApiDto>(MemberList.Destination);
            CreateMap<Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Grant.PersistedGrantsDto, PersistedGrantsApiDto>(MemberList.Destination);
        }
    }
}