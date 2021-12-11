// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.ApiResources;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Constants;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks
{
    public static class ApiResourceApiDtoMock
    {
        public static List<string> AllowedSigningAlgorithms()
        {
            var algs = new List<string>
            {
                "RS256",
                "RS512",
                "ES256",
                "ES384",
                "ES512"
            };

            return algs;
        }

        public static Faker<ApiResourceApiDto> GetApiResourceFaker(int id)
        {            
            var fakerApiResource = new Faker<ApiResourceApiDto>()
                .RuleFor(o => o.Name, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Description, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.DisplayName, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.Enabled, f => f.Random.Bool())
                .RuleFor(o => o.RequireResourceIndicator, f => f.Random.Bool())
                .RuleFor(o => o.UserClaims, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => f.PickRandom(ClientConsts.GetStandardClaims())).ToList())
                .RuleFor(o => o.ShowInDiscoveryDocument, f => f.Random.Bool())
                .RuleFor(o => o.AllowedAccessTokenSigningAlgorithms, f => AllowedSigningAlgorithms().Take(f.Random.Number(1, 5)).ToList());
            
            return fakerApiResource;
        }

	    public static ApiResourcePropertyApiDto GenerateRandomApiResourceProperty(int id)
	    {
		    var apiResourcePropertyFaker = ApiResourcePropertyFaker(id);

		    var propertyTesting = apiResourcePropertyFaker.Generate();

		    return propertyTesting;
	    }

        public static Faker<ApiResourcePropertyApiDto> ApiResourcePropertyFaker(int id)
        {
            var apiResourcePropertyFaker = new Faker<ApiResourcePropertyApiDto>()
                .StrictMode(false)
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Key, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Value, f => Guid.NewGuid().ToString());

            return apiResourcePropertyFaker;
	    }
        
        public static Faker<ApiSecretApiDto> GetApiSecretFaker(int id)
        {
            var fakerApiSecret = new Faker<ApiSecretApiDto>()
                .RuleFor(o => o.Type, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Value, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Description, f => f.Random.Words(f.Random.Number(1, 5)))
                .RuleFor(o => o.Expiration, f => f.Date.Future());                

            return fakerApiSecret;
        }
   
        public static ApiResourceApiDto GenerateRandomApiResource(int id)
        {
            var apiResource = GetApiResourceFaker(id).Generate();

            return apiResource;
        }

        public static ApiSecretApiDto GenerateRandomApiSecret(int id)
        {
            var apiSecret = GetApiSecretFaker(id).Generate();

            return apiSecret;
        }
    }
}
