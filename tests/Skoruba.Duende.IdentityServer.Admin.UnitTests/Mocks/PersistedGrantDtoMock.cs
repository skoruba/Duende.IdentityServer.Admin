// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Grant;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks
{
    public class PersistedGrantDtoMock
    {
        public static List<string> PersistedGransList()
        {
            var persistedGrants = new List<string> { "user_consent", "refresh_token", "reference_token" };

            return persistedGrants;
        }

        public static Faker<PersistedGrantDto> PersistedGrantFaker(string key, string subjectId)
        {
            var persistedGrantFaker = new Faker<PersistedGrantDto>()
                .StrictMode(true)
                .RuleFor(o => o.Id, f=> f.Random.Int())
                .RuleFor(o => o.Key, key)
                .RuleFor(o => o.ClientId, Guid.NewGuid().ToString)
                .RuleFor(o => o.CreationTime, f => f.Date.Past())
                .RuleFor(o => o.Data, f => f.Random.Words(f.Random.Number(1, 10)))
                .RuleFor(o => o.Type, f => f.PickRandom(PersistedGransList()))
                .RuleFor(o => o.Expiration, f => f.Date.Future())
                .RuleFor(o => o.SubjectId, f => subjectId)
                .RuleFor(o => o.SubjectName, Guid.NewGuid().ToString())
                .RuleFor(o=> o.ConsumedTime, f=> f.Date.Soon())
                .RuleFor(o => o.SessionId, Guid.NewGuid().ToString())
                .RuleFor(o => o.Description, Guid.NewGuid().ToString);

            return persistedGrantFaker;
        }

        public static PersistedGrantDto GenerateRandomPersistedGrant(string key, string subjectId)
        {
            var persistedGrantFaker = PersistedGrantFaker(key, subjectId);

            var persistedGrant = persistedGrantFaker.Generate();

            return persistedGrant;
        }
    }
}



