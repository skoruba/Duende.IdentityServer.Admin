// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.ApiScopes;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Constants;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks
{
    public class ApiScopeApiDtoMock
    {
        public static ApiScopeApiDto GenerateRandomApiScope(int id)
        {
            var apiScope = GetApiScopeFaker(id).Generate();

            return apiScope;
        }

        public static Faker<ApiScopeApiDto> GetApiScopeFaker(int id)
        {
            var fakerApiScope = new Faker<ApiScopeApiDto>()
                .RuleFor(o => o.Name, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Description, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.DisplayName, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.UserClaims, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => f.PickRandom(ClientConsts.GetStandardClaims())).ToList())
                .RuleFor(o => o.Emphasize, f => f.Random.Bool())
                .RuleFor(o => o.Required, f => f.Random.Bool())
                .RuleFor(o => o.ShowInDiscoveryDocument, f => f.Random.Bool())
                .RuleFor(o => o.Enabled, f => f.Random.Bool());

            return fakerApiScope;
        }

        public static ApiScopePropertyApiDto GenerateRandomApiScopeProperty(int id)
        {
            var apiScopePropertyFaker = ApiScopePropertyFaker(id);

            var propertyTesting = apiScopePropertyFaker.Generate();

            return propertyTesting;
        }

        public static Faker<ApiScopePropertyApiDto> ApiScopePropertyFaker(int id)
        {
            var apiResourcePropertyFaker = new Faker<ApiScopePropertyApiDto>()
                .StrictMode(false)
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Key, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Value, f => Guid.NewGuid().ToString());

            return apiResourcePropertyFaker;
        }
    }
}