// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.IdentityResources;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Constants;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks
{
    public static class IdentityResourceApiDtoMock
    {
        public static Faker<IdentityResourceApiDto> GetIdentityResourceFaker(int id)
        {
            var fakerIdentityResource = new Faker<IdentityResourceApiDto>()
                .RuleFor(o => o.Name, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Description, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.DisplayName, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.Enabled, f => f.Random.Bool())
                .RuleFor(o => o.Emphasize, f => f.Random.Bool())
                .RuleFor(o => o.ShowInDiscoveryDocument, f => f.Random.Bool())
                .RuleFor(o => o.Required, f => f.Random.Bool())                
                .RuleFor(o => o.UserClaims, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => f.PickRandom(ClientConsts.GetStandardClaims())).ToList());

            return fakerIdentityResource;
        }

        public static IdentityResourceApiDto GenerateRandomIdentityResource(int id)
        {
            var identityResource = GetIdentityResourceFaker(id).Generate();

            return identityResource;
        }

	    public static IdentityResourcePropertyApiDto GenerateRandomIdentityResourceProperty(int id)
	    {
		    var identityResourcePropertyFaker = IdentityResourcePropertyFaker(id);

		    var propertyTesting = identityResourcePropertyFaker.Generate();

		    return propertyTesting;
	    }

	    public static Faker<IdentityResourcePropertyApiDto> IdentityResourcePropertyFaker(int id)
        {
            var identityResourcePropertyFaker = new Faker<IdentityResourcePropertyApiDto>()
                .StrictMode(false)
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Key, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Value, f => Guid.NewGuid().ToString());

		    return identityResourcePropertyFaker;
	    }
	}
}
