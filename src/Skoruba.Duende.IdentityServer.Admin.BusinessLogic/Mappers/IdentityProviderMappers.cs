// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using AutoMapper;
using Duende.IdentityServer.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Common;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers
{
    public static class IdentityProviderMappers
    {
        static IdentityProviderMappers()
        {
            Mapper = new MapperConfiguration(cfg => cfg.AddProfile<IdentityProviderMapperProfile>())
                .CreateMapper();
        }

        internal static IMapper Mapper { get; }


        public static IdentityProviderDto ToModel(this IdentityProvider identityProvider)
        {
            return identityProvider == null ? null : Mapper.Map<IdentityProviderDto>(identityProvider);
        }

        public static IdentityProvidersDto ToModel(this PagedList<IdentityProvider> identityProvider)
        {
            return identityProvider == null ? null : Mapper.Map<IdentityProvidersDto>(identityProvider);
        }

        public static List<IdentityProviderDto> ToModel(this List<IdentityProvider> identityProvider)
        {
            return identityProvider == null ? null : Mapper.Map<List<IdentityProviderDto>>(identityProvider);
        }

        public static IdentityProvider ToEntity(this IdentityProviderDto identityProvider)
        {
            return identityProvider == null ? null : Mapper.Map<IdentityProvider>(identityProvider);
        }
        
        public static List<IdentityProvider> ToEntity(this List<IdentityProviderDto> identityProvider)
        {
            return identityProvider == null ? null : Mapper.Map<List<IdentityProvider>>(identityProvider);
        }

    }
}