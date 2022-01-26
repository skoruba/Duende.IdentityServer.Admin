using System;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Key;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks
{
    public class KeyApiDtoMock
    {
        public static Faker<KeyApiDto> KeyFaker(string id)
        {
            var keyFaker = new Faker<KeyApiDto>()
                .StrictMode(true)
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Algorithm, Guid.NewGuid().ToString())
                .RuleFor(o => o.Created, f => f.Date.Future())
                .RuleFor(o => o.Version, f => f.Random.Int(0))
                .RuleFor(o => o.IsX509Certificate, f => f.Random.Bool())
                .RuleFor(o => o.Use, Guid.NewGuid().ToString());

            return keyFaker;
        }

        public static KeyApiDto GenerateRandomKey(string id)
        {
            var keyFaker = KeyFaker(id);

            var key = keyFaker.Generate();

            return key;
        }
    }
}