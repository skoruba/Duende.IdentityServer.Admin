using System.Linq;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.Api.Mappers;
using Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mappers
{
    public class IdentityProviderMappers
    {
        [Fact]
        public void CanMapIdentityProviderApiDtoToIdentityProviderDto()
        {
            var IdentityProviderApiDto = IdentityProviderApiDtoMock.GenerateRandomIdentityProvider(1);

            var IdentityProviderDto = IdentityProviderApiDto.ToIdentityProviderApiModel<IdentityProviderDto>();

            IdentityProviderDto.Should().NotBeNull();

            IdentityProviderDto.Should().BeEquivalentTo(IdentityProviderApiDto, options => options
                .Excluding(x => x.IdentityProviderProperties));

            IdentityProviderDto.Properties.Values.Should().BeEquivalentTo(
                IdentityProviderApiDto.IdentityProviderProperties.Select(p => new IdentityProviderPropertyDto
                    { Name = p.Key, Value = p.Value }));
        }

        [Fact]
        public void CanMapIdentityProviderDtoToIdentityProviderApiDto()
        {
            var IdentityProviderDto = IdentityProviderDtoMock.GenerateRandomIdentityProvider(1);

            var IdentityProviderApiDto = IdentityProviderDto.ToIdentityProviderApiModel<IdentityProviderApiDto>();

            IdentityProviderApiDto.Should().BeEquivalentTo(IdentityProviderDto, options => options
                .Excluding(x => x.Properties));

            IdentityProviderApiDto.IdentityProviderProperties.Should().BeEquivalentTo(
                IdentityProviderDto.Properties.Values.ToDictionary(p=>p.Name, p=>p.Value));

        }

    }
}