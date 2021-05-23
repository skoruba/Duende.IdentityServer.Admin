// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.PersistedGrants;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks
{
    public class PersistedGrantApiDtoMock
    {
        public static List<string> PersistedGransList()
        {
            var persistedGrants = new List<string> { "user_consent", "refresh_token", "reference_token" };

            return persistedGrants;
        }

        public static Faker<PersistedGrantApiDto> PersistedGrantFaker(string key, int subjectId = 0)
        {
            var persistedGrantFaker = new Faker<PersistedGrantApiDto>()
                .StrictMode(true)
                .RuleFor(o => o.Key, key)
                .RuleFor(o => o.ClientId, Guid.NewGuid().ToString)
                .RuleFor(o => o.CreationTime, f => f.Date.Past())
                .RuleFor(o => o.Data, f => f.Random.Words(f.Random.Number(1, 10)))
                .RuleFor(o => o.Type, f => f.PickRandom(PersistedGransList()))
                .RuleFor(o => o.Expiration, f => f.Date.Future())
                .RuleFor(o => o.SubjectId, f => subjectId == 0 ? f.Random.Number(int.MaxValue).ToString() : subjectId.ToString());

            return persistedGrantFaker;
        }

        public static PersistedGrantApiDto GenerateRandomPersistedGrant(string key, int subjectId = 0)
        {
            var persistedGrantFaker = PersistedGrantFaker(key, subjectId);

            var persistedGrant = persistedGrantFaker.Generate();

            return persistedGrant;
        }
    }
}



