using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.ApiResources;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.IdentityResources;
using Skoruba.Duende.IdentityServer.Admin.Api.Mappers;
using Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mappers
{
    public class IdentityResourceMappers
    {
        [Fact]
        public void CanMapIdentityResourceApiDtoToIdentityResourceDto()
        {
            var identityResourceApiDto = IdentityResourceApiDtoMock.GenerateRandomIdentityResource(1);

            var identityResourceDto = identityResourceApiDto.ToIdentityResourceApiModel<IdentityResourceDto>();

            identityResourceDto.Should().NotBeNull();

            identityResourceApiDto.ShouldBeEquivalentTo(identityResourceDto);
        }

        [Fact]
        public void CanMapIdentityResourceDtoToIdentityResourceApiDto()
        {
            var identityResourceDto = IdentityResourceDtoMock.GenerateRandomIdentityResource(1);

            var identityResourceApiDto = identityResourceDto.ToIdentityResourceApiModel<IdentityResourceApiDto>();

            identityResourceDto.ShouldBeEquivalentTo(identityResourceApiDto, options => options
                .Excluding(x => x.UserClaimsItems));
        }

        [Fact]
        public void CanMapIdentityResourcePropertyApiDtoToIdentityResourcePropertyDto()
        {
            var identityResourcePropertyApiDto = IdentityResourceApiDtoMock.GenerateRandomIdentityResourceProperty(1);

            var identityResourcePropertiesDto = identityResourcePropertyApiDto.ToIdentityResourceApiModel<IdentityResourcePropertiesDto>();

            identityResourcePropertyApiDto.Id.Should().Be(identityResourcePropertiesDto.IdentityResourcePropertyId);

            identityResourcePropertyApiDto.ShouldBeEquivalentTo(identityResourcePropertiesDto, options => options.Excluding(x => x.Id));
        }

        [Fact]
        public void CanMapIdentityResourcePropertyDtoToIdentityResourcePropertyApiDto()
        {
            var identityResourcePropertyDto = IdentityResourceDtoMock.GenerateRandomIdentityResourceProperty(1, 1);

            var identityResourcePropertyApiDto = identityResourcePropertyDto.ToIdentityResourceApiModel<IdentityResourcePropertyApiDto>();

            identityResourcePropertyDto.IdentityResourcePropertyId.Should().Be(identityResourcePropertyApiDto.Id);

            identityResourcePropertyDto.ShouldBeEquivalentTo(identityResourcePropertyApiDto, options =>
                options.Excluding(x => x.IdentityResourceId)
                    .Excluding(x => x.IdentityResourceName)
                    .Excluding(x => x.PageSize)
                    .Excluding(x => x.TotalCount)
                    .Excluding(x => x.IdentityResourcePropertyId)
                    .Excluding(x => x.IdentityResourceProperties));
        }
    }
}