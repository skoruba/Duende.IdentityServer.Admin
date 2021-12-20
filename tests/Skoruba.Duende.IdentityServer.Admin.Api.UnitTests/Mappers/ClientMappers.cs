using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Clients;
using Skoruba.Duende.IdentityServer.Admin.Api.Mappers;
using Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mappers
{
    public class ClientMappers
    {
        [Fact]
        public void CanMapClientApiDtoToClientDto()
        {
            //Generate DTO
            var clientApiDto = ClientDtoApiMock.GenerateRandomClient(1);

            var clientDto = clientApiDto.ToClientApiModel<ClientDto>();

            clientDto.Should().NotBeNull();

            clientDto.Should().BeEquivalentTo(clientApiDto);
        }

        [Fact]
        public void CanMapClientDtoToClientApiDto()
        {
            //Generate DTO
            var clientDto = ClientDtoMock.GenerateRandomClient(1);

            var clientApiDto = clientDto.ToClientApiModel<ClientApiDto>();

            clientDto.Should().NotBeNull();

            clientApiDto.Should().BeEquivalentTo(clientDto, options =>
                options.Excluding(o => o.AllowedCorsOriginsItems)
                    .Excluding(o => o.AllowedGrantTypesItems)
                    .Excluding(o => o.AllowedIdentityTokenSigningAlgorithmsItems)
                    .Excluding(o => o.AllowedScopesItems)
                    .Excluding(o => o.IdentityProviderRestrictionsItems)
                    .Excluding(o => o.PostLogoutRedirectUrisItems)
                    .Excluding(o => o.RedirectUrisItems)

                    .Excluding(o => o.ClientSecrets)
                    .Excluding(o => o.RefreshTokenExpirations)
                    .Excluding(o => o.RefreshTokenUsages)
                    .Excluding(o => o.ClientType)
                    .Excluding(o => o.AccessTokenTypes)
                    .Excluding(o => o.ProtocolTypes));
        }

        [Fact]
        public void CanMapClientApiSecretToClientSecretDto()
        {
            var clientSecretApi = ClientDtoApiMock.GenerateRandomClientSecret(1);

            var clientSecretsDto = clientSecretApi.ToClientApiModel<ClientSecretsDto>();

            clientSecretApi.Id.Should().Be(clientSecretsDto.ClientSecretId);

            clientSecretsDto.Should().BeEquivalentTo(clientSecretApi, options => options.Excluding(x => x.Id));
        }

        [Fact]
        public void CanMapClientSecretDtoToClientSecretApiDto()
        {
            var clientSecretDto = ClientDtoMock.GenerateRandomClientSecret(1, 1);

            var clientSecretApiDto = clientSecretDto.ToClientApiModel<ClientSecretApiDto>();

            clientSecretDto.ClientSecretId.Should().Be(clientSecretApiDto.Id);

            clientSecretApiDto.Should().BeEquivalentTo(clientSecretDto, options =>
                options.Excluding(x => x.ClientId)
                    .Excluding(x => x.ClientSecrets)
                    .Excluding(x => x.ClientName)
                    .Excluding(x => x.PageSize)
                    .Excluding(x => x.HashTypes)
                    .Excluding(x => x.ClientSecretId)
                    .Excluding(x => x.HashTypeEnum)
                    .Excluding(x => x.TypeList)
                    .Excluding(x => x.TotalCount));
        }

        [Fact]
        public void CanMapClientClaimApiDtoToClientClaimDto()
        {
            var clientClaimApiDto = ClientDtoApiMock.GenerateRandomClientClaim(1);

            var clientClaimsDto = clientClaimApiDto.ToClientApiModel<ClientClaimsDto>();

            clientClaimApiDto.Id.Should().Be(clientClaimsDto.ClientClaimId);

            clientClaimsDto.Should().BeEquivalentTo(clientClaimApiDto, options => options.Excluding(x => x.Id));
        }

        [Fact]
        public void CanMapClientClaimDtoToClientClaimApiDto()
        {
            var clientClaimDto = ClientDtoMock.GenerateRandomClientClaim(1, 1);

            var clientClaimApiDto = clientClaimDto.ToClientApiModel<ClientClaimApiDto>();

            clientClaimDto.ClientClaimId.Should().Be(clientClaimApiDto.Id);

            clientClaimApiDto.Should().BeEquivalentTo(clientClaimDto, options =>
                options.Excluding(x => x.ClientClaims)
                    .Excluding(x => x.PageSize)
                    .Excluding(x => x.TotalCount)
                    .Excluding(x => x.ClientId)
                    .Excluding(x => x.ClientName)
                    .Excluding(x => x.ClientClaimId));
        }

        [Fact]
        public void CanMapClientPropertyApiDtoToClientPropertyDto()
        {
            var clientPropertyApiDto = ClientDtoApiMock.GenerateRandomClientProperty(1);

            var clientPropertiesDto = clientPropertyApiDto.ToClientApiModel<ClientPropertiesDto>();

            clientPropertyApiDto.Id.Should().Be(clientPropertiesDto.ClientPropertyId);

            clientPropertiesDto.Should().BeEquivalentTo(clientPropertyApiDto, options => options.Excluding(x => x.Id));
        }
        
        [Fact]
        public void CanMapClientPropertyDtoToClientPropertyApiDto()
        {
            var clientPropertyDto = ClientDtoMock.GenerateRandomClientProperty(1, 1);

            var clientPropertyApiDto = clientPropertyDto.ToClientApiModel<ClientPropertyApiDto>();

            clientPropertyDto.ClientPropertyId.Should().Be(clientPropertyApiDto.Id);

            clientPropertyApiDto.Should().BeEquivalentTo(clientPropertyDto, options => 
                options.Excluding(x=> x.ClientId)
                    .Excluding(x=> x.ClientName)
                    .Excluding(x=> x.PageSize)
                    .Excluding(x=> x.TotalCount)
                    .Excluding(x=> x.ClientPropertyId)
                    .Excluding(x=> x.ClientProperties));
        }
    }
}