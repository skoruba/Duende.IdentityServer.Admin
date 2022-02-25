// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Constants;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks
{
    public static class IdentityProviderApiDtoMock
    {
        public static Faker<IdentityProviderApiDto> GetIdentityProviderFaker(int id)
        {
            var fakerIdentityResource = new Faker<IdentityProviderApiDto>()
                .RuleFor(o => o.Scheme, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Type, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.DisplayName, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.Enabled, f => f.Random.Bool())
                .RuleFor(o => o.IdentityProviderProperties, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => new {Key= f.Random.Words(f.Random.Number(1, 5)), Value = Guid.NewGuid().ToString()}).ToDictionary(arg => arg.Key, result => result.Value));

            return fakerIdentityResource;
        }

        public static IdentityProviderApiDto GenerateRandomIdentityProvider(int id)
        {
            var identityProvider = GetIdentityProviderFaker(id).Generate();

            return identityProvider;
        }
    }
}
