using System;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Key;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks
{
    public class KeyDtoMock
    {
        public static Faker<KeyDto> KeyFaker(string id)
        {
            var keyFaker = new Faker<KeyDto>()
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

        public static KeyDto GenerateRandomKey(string id)
        {
            var keyFaker = KeyFaker(id);

            var key = keyFaker.Generate();

            return key;
        }
    }
}