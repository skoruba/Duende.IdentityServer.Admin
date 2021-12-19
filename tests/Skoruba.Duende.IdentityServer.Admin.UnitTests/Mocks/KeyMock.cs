using System;
using Bogus;
using Duende.IdentityServer.EntityFramework.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks
{
    public class KeyMock
    {
        public static Faker<Key> KeyFaker(string id)
        {
            var keyFaker = new Faker<Key>()
                .StrictMode(true)
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Algorithm, Guid.NewGuid().ToString())
                .RuleFor(o => o.Created, f => f.Date.Future())
                .RuleFor(o => o.DataProtected, f => f.Random.Bool())
                .RuleFor(o => o.Version, f => f.Random.Int(0))
                .RuleFor(o => o.IsX509Certificate, f => f.Random.Bool())
                .RuleFor(o => o.Use, Guid.NewGuid().ToString())
                .RuleFor(o => o.Data, Guid.NewGuid().ToString());

            return keyFaker;
        }

        public static Key GenerateRandomKey(string id)
        {
            var keyFaker = KeyFaker(id);

            var key = keyFaker.Generate();

            return key;
        }
    }
}