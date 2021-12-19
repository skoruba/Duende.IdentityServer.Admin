using System;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Key;
using Skoruba.Duende.IdentityServer.Admin.Api.Mappers;
using Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Key;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mappers
{
    public class KeyMappers
    {
        [Fact]
        public void CanMapKeyDtoToKayApiDto()
        {
            var keyDto = KeyDtoMock.GenerateRandomKey(Guid.NewGuid().ToString());

            var keyApi = keyDto.ToKeyApiModel<KeyApiDto>();

            keyDto.ShouldBeEquivalentTo(keyApi);
        }

        [Fact]
        public void CanMapKeyApiDtoToKeyDto()
        {
            var keyApiDto = KeyApiDtoMock.GenerateRandomKey(Guid.NewGuid().ToString());

            var keyDto = keyApiDto.ToKeyApiModel<KeyDto>();

            keyApiDto.ShouldBeEquivalentTo(keyDto);
        }
    }
}