// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Constants;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks
{
    public static class IdentityProviderDtoMock
    {
        public static Faker<IdentityProviderDto> GetIdentityProviderFaker(int id)
        {
            var fakerIdentityResource = new Faker<IdentityProviderDto>()
                .RuleFor(o => o.Scheme, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Type, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.DisplayName, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Enabled, f => f.Random.Bool())
                .RuleFor(o => o.Properties, f =>  Enumerable.Range(1, f.Random.Int(1, 10)).ToDictionary(x=>x, x => new IdentityProviderPropertyDto{Name= f.Random.Words(f.Random.Number(1, 5)), Value = f.Random.Words(f.Random.Number(1, 5))}));

            return fakerIdentityResource;
        }

        public static IdentityProviderDto GenerateRandomIdentityProvider(int id)
        {
            var identityResource = GetIdentityProviderFaker(id).Generate();

            return identityResource;
        }

	    //public static IdentityProviderPropertiesDto GenerateRandomIdentityProviderProperty(int id, int identityProvider)
	    //{
		   // var identityProviderPropertyFaker = IdentityProviderPropertyFaker(id, identityProvider);

		   // var propertyTesting = identityProviderPropertyFaker.Generate();

		   // return propertyTesting;
	    //}

	    //public static Faker<IdentityProviderPropertiesDto> IdentityProviderPropertyFaker(int id, int identityProvider)
	    //{
		   // var identityResourcePropertyFaker = new Faker<IdentityProviderPropertiesDto>()
			  //  .StrictMode(false)
			  //  .RuleFor(o => o.Key, f => Guid.NewGuid().ToString())
			  //  .RuleFor(o => o.Value, f => Guid.NewGuid().ToString())
			  //  .RuleFor(o => o.identityProviderId, identityProvider);

		   // return identityResourcePropertyFaker;
	    //}
	}
}
