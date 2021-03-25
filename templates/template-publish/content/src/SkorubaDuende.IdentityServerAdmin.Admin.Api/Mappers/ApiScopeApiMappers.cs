// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using AutoMapper;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Mappers
{
    public static class ApiScopeApiMappers
    {
        static ApiScopeApiMappers()
        {
            Mapper = new MapperConfiguration(cfg => cfg.AddProfile<ApiScopeApiMapperProfile>())
                .CreateMapper();
        }

        internal static IMapper Mapper { get; }

        public static T ToApiScopeApiModel<T>(this object source)
        {
            return Mapper.Map<T>(source);
        }
    }
}







