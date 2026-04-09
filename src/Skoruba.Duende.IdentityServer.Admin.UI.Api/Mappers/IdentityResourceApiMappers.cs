// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using AutoMapper;
using Microsoft.Extensions.Logging.Abstractions;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Mappers
{
    public static class IdentityResourceApiMappers
    {
        static IdentityResourceApiMappers()
        {
            Mapper = new MapperConfiguration(cfg => cfg.AddProfile<IdentityResourceApiMapperProfile>(), NullLoggerFactory.Instance)
                .CreateMapper();
        }

        internal static IMapper Mapper { get; }

        public static T ToIdentityResourceApiModel<T>(this object source)
        {
            return Mapper.Map<T>(source);
        }
    }
}