// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers.Converters;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Mappers
{
    public class ClientMappers
    {
        [Fact]
        public void CanMapClientToModel()
        {
            //Generate entity
            var client = ClientMock.GenerateRandomClient(0);

            //Try map to DTO
            var clientDto = client.ToModel();

            //Asert
            clientDto.Should().NotBeNull();

            clientDto.Should().BeEquivalentTo(client, options =>
                options.Excluding(o => o.AllowedCorsOrigins)
                       .Excluding(o => o.RedirectUris)
                       .Excluding(o => o.PostLogoutRedirectUris)
                       .Excluding(o => o.AllowedGrantTypes)
                       .Excluding(o => o.AllowedScopes)
					   .Excluding(o => o.Created)
                       .Excluding(o => o.DPoPValidationMode)
                       .Excluding(o => o.AllowedIdentityTokenSigningAlgorithms)
                       .Excluding(o => o.IdentityProviderRestrictions));

            clientDto.DPoPValidationMode.Should().Be((int)client.DPoPValidationMode);
            
            //Assert collection
            clientDto.AllowedCorsOrigins.Should().BeEquivalentTo(client.AllowedCorsOrigins.Select(x => x.Origin));
            clientDto.RedirectUris.Should().BeEquivalentTo(client.RedirectUris.Select(x => x.RedirectUri));
            clientDto.PostLogoutRedirectUris.Should().BeEquivalentTo(client.PostLogoutRedirectUris.Select(x => x.PostLogoutRedirectUri));
            clientDto.AllowedGrantTypes.Should().BeEquivalentTo(client.AllowedGrantTypes.Select(x => x.GrantType));
            clientDto.AllowedScopes.Should().BeEquivalentTo(client.AllowedScopes.Select(x => x.Scope));
            clientDto.IdentityProviderRestrictions.Should().BeEquivalentTo(client.IdentityProviderRestrictions.Select(x => x.Provider));
            var allowedAlgList = AllowedSigningAlgorithmsConverter.Converter.Convert(client.AllowedIdentityTokenSigningAlgorithms, null);
            clientDto.AllowedIdentityTokenSigningAlgorithms.Should().BeEquivalentTo(allowedAlgList);
        }

        [Fact]
        public void CanMapClientDtoToEntity()
        {
            //Generate DTO
            var clientDto = ClientDtoMock.GenerateRandomClient(0);

            //Try map to entity
            var client = clientDto.ToEntity();

            client.Should().NotBeNull();

            clientDto.Should().BeEquivalentTo(client, options =>
                options.Excluding(o => o.AllowedCorsOrigins)
                    .Excluding(o => o.RedirectUris)
                    .Excluding(o => o.PostLogoutRedirectUris)
                    .Excluding(o => o.AllowedGrantTypes)
                    .Excluding(o => o.AllowedScopes)
                    .Excluding(o => o.AllowedIdentityTokenSigningAlgorithms)
                    .Excluding(o => o.Created)
                    .Excluding(o => o.DPoPValidationMode)
					.Excluding(o => o.IdentityProviderRestrictions));

            clientDto.DPoPValidationMode.Should().Be((int)client.DPoPValidationMode);

            //Assert collection
            clientDto.AllowedCorsOrigins.Should().BeEquivalentTo(client.AllowedCorsOrigins.Select(x => x.Origin));
            clientDto.RedirectUris.Should().BeEquivalentTo(client.RedirectUris.Select(x => x.RedirectUri));
            clientDto.PostLogoutRedirectUris.Should().BeEquivalentTo(client.PostLogoutRedirectUris.Select(x => x.PostLogoutRedirectUri));
            clientDto.AllowedGrantTypes.Should().BeEquivalentTo(client.AllowedGrantTypes.Select(x => x.GrantType));
            clientDto.AllowedScopes.Should().BeEquivalentTo(client.AllowedScopes.Select(x => x.Scope));
            clientDto.IdentityProviderRestrictions.Should().BeEquivalentTo(client.IdentityProviderRestrictions.Select(x => x.Provider));
            var allowedAlgList = AllowedSigningAlgorithmsConverter.Converter.Convert(client.AllowedIdentityTokenSigningAlgorithms, null);
            clientDto.AllowedIdentityTokenSigningAlgorithms.Should().BeEquivalentTo(allowedAlgList);
        }

        [Fact]
        public void CanMapClientClaimToModel()
        {
            var clientClaim = ClientMock.GenerateRandomClientClaim(0);

            var clientClaimsDto = clientClaim.ToModel();

            //Assert
            clientClaimsDto.Should().NotBeNull();

            clientClaimsDto.Should().BeEquivalentTo(clientClaim, options =>
                options.Excluding(o => o.Id)
                    .Excluding(o => o.Client));
        }

        [Fact]
        public void CanMapClientClaimToEntity()
        {
            var clientClaimDto = ClientDtoMock.GenerateRandomClientClaim(0, 0);

            var clientClaim = clientClaimDto.ToEntity();

            //Assert
            clientClaim.Should().NotBeNull();

            clientClaimDto.Should().BeEquivalentTo(clientClaim, options =>
                options.Excluding(o => o.Id)
                    .Excluding(o => o.Client));
        }

        [Fact]
        public void CanMapClientSecretToModel()
        {
            var clientSecret = ClientMock.GenerateRandomClientSecret(0);

            var clientSecretsDto = clientSecret.ToModel();

            //Assert
            clientSecretsDto.Should().NotBeNull();

            clientSecretsDto.Should().BeEquivalentTo(clientSecret, options =>
                options.Excluding(o => o.Id)
	                .Excluding(o => o.Created)
					.Excluding(o => o.Client));
        }

        [Fact]
        public void CanMapClientSecretToEntity()
        {
            var clientSecretsDto = ClientDtoMock.GenerateRandomClientSecret(0, 0);

            var clientSecret = clientSecretsDto.ToEntity();

            //Assert
            clientSecret.Should().NotBeNull();

            clientSecretsDto.Should().BeEquivalentTo(clientSecret, options =>
                options.Excluding(o => o.Id)
	                .Excluding(o => o.Created)
					.Excluding(o => o.Client));
        }

        [Fact]
        public void CanMapClientPropertyToModel()
        {
            var clientProperty = ClientMock.GenerateRandomClientProperty(0);

            var clientPropertiesDto = clientProperty.ToModel();

            //Assert
            clientPropertiesDto.Should().NotBeNull();

            clientPropertiesDto.Should().BeEquivalentTo(clientProperty, options =>
                options.Excluding(o => o.Id)
                    .Excluding(o => o.Client));
        }

        [Fact]
        public void CanMapClientPropertyToEntity()
        {
            var clientPropertiesDto = ClientDtoMock.GenerateRandomClientProperty(0, 0);

            var clientProperty = clientPropertiesDto.ToEntity();

            //Assert
            clientProperty.Should().NotBeNull();

            clientPropertiesDto.Should().BeEquivalentTo(clientProperty, options =>
                options.Excluding(o => o.Id)
                    .Excluding(o => o.Client));
        }
    }
}
