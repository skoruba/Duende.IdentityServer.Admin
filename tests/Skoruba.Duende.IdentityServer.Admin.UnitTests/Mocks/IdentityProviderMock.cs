// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Bogus;
using Duende.IdentityServer.EntityFramework.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks
{
    public static class IdentityProviderMock
    {
        public static Faker<IdentityProvider> GetIdentityProviderFaker(int id)
        {
            var fakerIdentityResource = new Faker<IdentityProvider>()
                .RuleFor(o => o.Scheme, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Type, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.DisplayName, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.Enabled, f => f.Random.Bool())
                .RuleFor(o => o.Properties, System.Text.Json.JsonSerializer.Serialize(new Dictionary<string, string> {{"x", "y"}}));

            return fakerIdentityResource;
        }
        
        public static IdentityProvider GenerateRandomIdentityProvider(int id)
        {
            var identityProvider = GetIdentityProviderFaker(id).Generate();

            return identityProvider;
        }
    }
}
