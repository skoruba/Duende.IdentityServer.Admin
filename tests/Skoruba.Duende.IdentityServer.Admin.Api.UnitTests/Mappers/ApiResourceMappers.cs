using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.ApiResources;
using Skoruba.Duende.IdentityServer.Admin.Api.Mappers;
using Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mappers
{
    public class ApiResourceMappers
    {
        [Fact]
        public void CanMapApiResourceApiDtoToApiResourceDto()
        {
            var apiResourceApiDto = ApiResourceApiDtoMock.GenerateRandomApiResource(1);
            
            var apiResourceDto = apiResourceApiDto.ToApiResourceApiModel<ApiResourceDto>();

            apiResourceDto.Should().NotBeNull();

            apiResourceDto.Should().BeEquivalentTo(apiResourceApiDto);
        }
        
        [Fact]
        public void CanMapApiResourceDtoToApiResourceApiDto()
        {
            var apiResourceDto = ApiResourceDtoMock.GenerateRandomApiResource(1);

            var apiResourceApiDto = apiResourceDto.ToApiResourceApiModel<ApiResourceApiDto>();

            apiResourceApiDto.Should().BeEquivalentTo(apiResourceDto, options => options
                .Excluding(x => x.AllowedAccessTokenSigningAlgorithmsItems)
                .Excluding(x=> x.ScopesItems)
                .Excluding(x=> x.UserClaimsItems));
        }

        [Fact]
        public void CanMapApiResourceSecretApiDtoToApiResourceSecretDto()
        {
            var apiSecretApiDto = ApiResourceApiDtoMock.GenerateRandomApiSecret(1);

            var apiSecretsDto = apiSecretApiDto.ToApiResourceApiModel<ApiSecretsDto>();

            apiSecretApiDto.Id.Should().Be(apiSecretsDto.ApiSecretId);

            apiSecretsDto.Should().BeEquivalentTo(apiSecretApiDto, options => options.Excluding(x=> x.Id));
        }

        [Fact]
        public void CanMapApiResourceSecretDtoToApiResourceSecretApiDto()
        {
            var apiResourceSecret = ApiResourceDtoMock.GenerateRandomApiSecret(1, 1);

            var apiResourceApiDto = apiResourceSecret.ToApiResourceApiModel<ApiSecretApiDto>();

            apiResourceSecret.ApiResourceId.Should().Be(apiResourceApiDto.Id);

            apiResourceApiDto.Should().BeEquivalentTo(apiResourceSecret, options =>
                options.Excluding(x => x.ApiResourceId)
                    .Excluding(x => x.ApiSecrets)
                    .Excluding(x => x.ApiResourceName)
                    .Excluding(x => x.PageSize)
                    .Excluding(x => x.HashTypes)
                    .Excluding(x => x.ApiSecretId)
                    .Excluding(x => x.HashTypeEnum)
                    .Excluding(x => x.TypeList)
                    .Excluding(x => x.TotalCount));
        }

        [Fact]
        public void CanMapApiResourcePropertyApiDtoToApiResourcePropertyDto()
        {
            var apiResourcePropertyApiDto = ApiResourceApiDtoMock.GenerateRandomApiResourceProperty(1);

            var apiResourcePropertiesDto = apiResourcePropertyApiDto.ToApiResourceApiModel<ApiResourcePropertiesDto>();

            apiResourcePropertyApiDto.Id.Should().Be(apiResourcePropertiesDto.ApiResourcePropertyId);

            apiResourcePropertiesDto.Should().BeEquivalentTo(apiResourcePropertyApiDto, options => options.Excluding(x=> x.Id));
        }

        [Fact]
        public void CanMapApiResourcePropertyDtoToApiResourcePropertyApiDto()
        {
            var apiResourcePropertyDto = ApiResourceDtoMock.GenerateRandomApiResourceProperty(1, 1);

            var apiResourcePropertyApiDto = apiResourcePropertyDto.ToApiResourceApiModel<ApiResourcePropertyApiDto>();

            apiResourcePropertyDto.ApiResourcePropertyId.Should().Be(apiResourcePropertyApiDto.Id);

            apiResourcePropertyApiDto.Should().BeEquivalentTo(apiResourcePropertyDto, options =>
                options.Excluding(x => x.ApiResourceId)
                    .Excluding(x => x.ApiResourceName)
                    .Excluding(x => x.PageSize)
                    .Excluding(x => x.TotalCount)
                    .Excluding(x => x.ApiResourcePropertyId)
                    .Excluding(x => x.ApiResourceProperties));
        }
    }
}