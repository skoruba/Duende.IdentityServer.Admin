// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Mappers
{
    public static class ApiResourceApiMappers
    {
        static ApiResourceApiMappers()
        {
            Mapper = new MapperConfiguration(cfg => cfg.AddProfile<ApiResourceApiMapperProfile>(), NullLoggerFactory.Instance)
                .CreateMapper();
        }

        internal static IMapper Mapper { get; }

        public static T ToApiResourceApiModel<T>(this object source)
        {
            return Mapper.Map<T>(source);
        }
    }
}