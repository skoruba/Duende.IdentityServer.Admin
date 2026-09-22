// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Net;
using System.Net.Http.Json;
using System.Collections.Generic;
using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared.Dtos.Common;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Clients;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class ClientsControllerTests : AdminApiTestBase
    {
        private const string ClientsRoute = "api/clients";
        private const string ClientSearchParameter = "searchText";
        private const string CanInsertClientRoute = $"{ClientsRoute}/CanInsertClient";
        private const string ClientIdPrefix = "api_integration_client";
        private const string UpdatedSuffix = "_updated";
        private const string CloneRouteSegment = "clone";
        private const string SecretsRouteSegment = "secrets";
        private const string PropertiesRouteSegment = "properties";
        private const string ClaimsRouteSegment = "claims";
        private const string ClaimTypePrefix = "client_claim_type";
        private const string ClaimValuePrefix = "client_claim_value";
        private const string SecretValuePrefix = "client_secret_value";
        private const string SharedSecretType = "SharedSecret";
        private const string ClientPropertyKeyPrefix = "client_property_key";
        private const string ClientPropertyValuePrefix = "client_property_value";
        private const string DefaultMachineGrantType = "client_credentials";
        private const int DefaultDPoPValidationMode = 0;
        private const int NonDefaultEntityId = 1;

        public ClientsControllerTests(TestFixture fixture) : base(fixture)
        {
        }


        private static List<ClientClaimApiDto> DistinctClaims(List<ClientClaimApiDto> values)
        {
            return values?
                .Where(x => !string.IsNullOrWhiteSpace(x.Type) && !string.IsNullOrWhiteSpace(x.Value))
                .GroupBy(x => $"{x.Type}:{x.Value}", StringComparer.Ordinal)
                .Select(x => x.First())
                .ToList() ?? new List<ClientClaimApiDto>();
        }

        private static List<ClientPropertyApiDto> DistinctProperties(List<ClientPropertyApiDto> values)
        {
            return values?
                .Where(x => !string.IsNullOrWhiteSpace(x.Key))
                .GroupBy(x => x.Key, StringComparer.Ordinal)
                .Select(x => x.First())
                .ToList() ?? new List<ClientPropertyApiDto>();
        }

        private static ClientApiDto BuildClientCreatePayload(string clientId)
        {
            var payload = ClientDtoApiMock.GenerateRandomClient(0);

            payload.Id = 0;
            payload.ClientId = clientId;
            payload.ClientName = clientId;
            payload.AbsoluteRefreshTokenLifetime = 2_592_000;
            payload.AccessTokenLifetime = 3_600;
            payload.AuthorizationCodeLifetime = 300;
            payload.IdentityTokenLifetime = 300;
            payload.SlidingRefreshTokenLifetime = 1_296_000;
            payload.DeviceCodeLifetime = 300;
            payload.RefreshTokenExpiration = payload.RefreshTokenExpiration % 2;
            payload.RefreshTokenUsage = payload.RefreshTokenUsage % 2;
            payload.AccessTokenType = payload.AccessTokenType % 2;
            payload.DPoPValidationMode = DefaultDPoPValidationMode;
            payload.DPoPClockSkew = TimeSpan.FromMinutes(5);
            payload.AllowedGrantTypes = DistinctStrings(payload.AllowedGrantTypes);
            if (payload.AllowedGrantTypes.Count == 0)
            {
                payload.AllowedGrantTypes.Add(DefaultMachineGrantType);
            }

            payload.AllowedScopes = DistinctStrings(payload.AllowedScopes);
            payload.AllowedCorsOrigins = DistinctStrings(payload.AllowedCorsOrigins);
            payload.RedirectUris = DistinctStrings(payload.RedirectUris);
            payload.PostLogoutRedirectUris = DistinctStrings(payload.PostLogoutRedirectUris);
            payload.IdentityProviderRestrictions = DistinctStrings(payload.IdentityProviderRestrictions);
            payload.AllowedIdentityTokenSigningAlgorithms = DistinctStrings(payload.AllowedIdentityTokenSigningAlgorithms);
            payload.Claims = DistinctClaims(payload.Claims);
            payload.Properties = DistinctProperties(payload.Properties);

            return payload;
        }

        private static void AssertClientCreatePayloadWasPersisted(
            ClientApiDto expected,
            ClientApiDto actual)
        {
            actual.ClientId.Should().Be(expected.ClientId);
            actual.ClientName.Should().Be(expected.ClientName);
            actual.Description.Should().Be(expected.Description);
            actual.Enabled.Should().Be(expected.Enabled);
            actual.RequireClientSecret.Should().Be(expected.RequireClientSecret);
            actual.RequireConsent.Should().Be(expected.RequireConsent);
            actual.RequirePkce.Should().Be(expected.RequirePkce);
            actual.ProtocolType.Should().Be(expected.ProtocolType);
            actual.AccessTokenType.Should().Be(expected.AccessTokenType);
            actual.AccessTokenLifetime.Should().Be(expected.AccessTokenLifetime);
            actual.IdentityTokenLifetime.Should().Be(expected.IdentityTokenLifetime);
            actual.AuthorizationCodeLifetime.Should().Be(expected.AuthorizationCodeLifetime);
            actual.AbsoluteRefreshTokenLifetime.Should().Be(expected.AbsoluteRefreshTokenLifetime);
            actual.SlidingRefreshTokenLifetime.Should().Be(expected.SlidingRefreshTokenLifetime);
            actual.RefreshTokenUsage.Should().Be(expected.RefreshTokenUsage);
            actual.RefreshTokenExpiration.Should().Be(expected.RefreshTokenExpiration);
            actual.AllowOfflineAccess.Should().Be(expected.AllowOfflineAccess);
            actual.AllowAccessTokensViaBrowser.Should().Be(expected.AllowAccessTokensViaBrowser);
            actual.AllowPlainTextPkce.Should().Be(expected.AllowPlainTextPkce);
            actual.AllowRememberConsent.Should().Be(expected.AllowRememberConsent);
            actual.AlwaysIncludeUserClaimsInIdToken.Should().Be(expected.AlwaysIncludeUserClaimsInIdToken);
            actual.UpdateAccessTokenClaimsOnRefresh.Should().Be(expected.UpdateAccessTokenClaimsOnRefresh);
            actual.EnableLocalLogin.Should().Be(expected.EnableLocalLogin);
            actual.RequireRequestObject.Should().Be(expected.RequireRequestObject);
            actual.RequireDPoP.Should().Be(expected.RequireDPoP);
            actual.DPoPValidationMode.Should().Be(expected.DPoPValidationMode);
            actual.RequirePushedAuthorization.Should().Be(expected.RequirePushedAuthorization);
            actual.PushedAuthorizationLifetime.Should().Be(expected.PushedAuthorizationLifetime);
            actual.DeviceCodeLifetime.Should().Be(expected.DeviceCodeLifetime);
            actual.UserCodeType.Should().Be(expected.UserCodeType);
            actual.ClientClaimsPrefix.Should().Be(expected.ClientClaimsPrefix);
            actual.PairWiseSubjectSalt.Should().Be(expected.PairWiseSubjectSalt);
            actual.ClientUri.Should().Be(expected.ClientUri);
            actual.LogoUri.Should().Be(expected.LogoUri);
            actual.InitiateLoginUri.Should().Be(expected.InitiateLoginUri);
            actual.FrontChannelLogoutUri.Should().Be(expected.FrontChannelLogoutUri);
            actual.FrontChannelLogoutSessionRequired.Should().Be(expected.FrontChannelLogoutSessionRequired);
            actual.BackChannelLogoutUri.Should().Be(expected.BackChannelLogoutUri);
            actual.BackChannelLogoutSessionRequired.Should().Be(expected.BackChannelLogoutSessionRequired);
            actual.DPoPClockSkew.Should().Be(expected.DPoPClockSkew);
            actual.AllowedGrantTypes.Should().BeEquivalentTo(expected.AllowedGrantTypes);
            actual.AllowedScopes.Should().BeEquivalentTo(expected.AllowedScopes);
            actual.AllowedCorsOrigins.Should().BeEquivalentTo(expected.AllowedCorsOrigins);
            actual.RedirectUris.Should().BeEquivalentTo(expected.RedirectUris);
            actual.PostLogoutRedirectUris.Should().BeEquivalentTo(expected.PostLogoutRedirectUris);
            actual.IdentityProviderRestrictions.Should().BeEquivalentTo(expected.IdentityProviderRestrictions);
            actual.AllowedIdentityTokenSigningAlgorithms.Should().BeEquivalentTo(expected.AllowedIdentityTokenSigningAlgorithms);
            actual.Claims.Select(x => new { x.Type, x.Value })
                .Should().BeEquivalentTo(expected.Claims.Select(x => new { x.Type, x.Value }));
            actual.Properties.Select(x => new { x.Key, x.Value })
                .Should().BeEquivalentTo(expected.Properties.Select(x => new { x.Key, x.Value }));
        }

        private async Task<ClientApiDto> CreateMachineClientAsync(string clientId)
        {
            var createRequest = BuildClientCreatePayload(clientId);

            var createResponse = await Client.PostAsJsonAsync(ClientsRoute, createRequest);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var createdClient = await createResponse.Content.ReadFromJsonAsync<ClientApiDto>();
            createdClient.Should().NotBeNull();
            createdClient!.Id.Should().BeGreaterThan(0);
            createdClient.ClientId.Should().Be(clientId);

            return createdClient;
        }

        private static ClientCloneApiDto BuildClientClonePayload(int sourceClientId, string clonedClientId)
        {
            var payload = ClientDtoApiMock.GenerateClientCloneDto(sourceClientId);
            payload.Id = sourceClientId;
            payload.ClientId = clonedClientId;
            payload.ClientName = clonedClientId;

            return payload;
        }

        private async Task<ClientSecretApiDto> CreateClientSecretAsync(int clientId)
        {
            var secret = ClientDtoApiMock.GenerateRandomClientSecret(0);
            secret.Id = 0;
            // The mock picks a random secret type - a JWK one would be rejected, its value has to be a JSON Web Key
            secret.Type = SharedSecretType;
            secret.Value = UniqueValue(SecretValuePrefix);

            var route = $"{ById(ClientsRoute, clientId)}/{SecretsRouteSegment}";
            var response = await Client.PostAsJsonAsync(route, secret);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var createdSecret = await response.Content.ReadFromJsonAsync<ClientSecretApiDto>();
            createdSecret.Should().NotBeNull();
            createdSecret!.Id.Should().BeGreaterThan(0);
            createdSecret.Type.Should().Be(secret.Type);

            return createdSecret;
        }

        private async Task<ClientPropertyApiDto> CreateClientPropertyAsync(int clientId)
        {
            var property = ClientDtoApiMock.GenerateRandomClientProperty(0);
            property.Id = 0;
            property.Key = UniqueValue(ClientPropertyKeyPrefix);
            property.Value = UniqueValue(ClientPropertyValuePrefix);

            var route = $"{ById(ClientsRoute, clientId)}/{PropertiesRouteSegment}";
            var response = await Client.PostAsJsonAsync(route, property);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var createdProperty = await response.Content.ReadFromJsonAsync<ClientPropertyApiDto>();
            createdProperty.Should().NotBeNull();
            createdProperty!.Id.Should().BeGreaterThan(0);
            createdProperty.Key.Should().Be(property.Key);
            createdProperty.Value.Should().Be(property.Value);

            return createdProperty;
        }

        private async Task<ClientClaimApiDto> CreateClientClaimAsync(int clientId)
        {
            var claim = ClientDtoApiMock.GenerateRandomClientClaim(0);
            claim.Id = 0;
            claim.Type = UniqueValue(ClaimTypePrefix);
            claim.Value = UniqueValue(ClaimValuePrefix);

            var route = $"{ById(ClientsRoute, clientId)}/{ClaimsRouteSegment}";
            var response = await Client.PostAsJsonAsync(route, claim);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var createdClaim = await response.Content.ReadFromJsonAsync<ClientClaimApiDto>();
            createdClaim.Should().NotBeNull();
            createdClaim!.Id.Should().BeGreaterThan(0);
            createdClaim.Type.Should().Be(claim.Type);
            createdClaim.Value.Should().Be(claim.Value);

            return createdClaim;
        }

        [Fact]
        public async Task GetClientsAsAdmin()
        {
            SetupAdminAuthorization();

            var response = await Client.GetAsync(ClientsRoute);

            // Assert
            response.EnsureSuccessStatusCode();
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var clients = await response.Content.ReadFromJsonAsync<ClientsApiDto>();
            clients.Should().NotBeNull();
            clients!.Clients.Should().NotBeNull();
            clients.TotalCount.Should().BeGreaterOrEqualTo(0);
        }

        [Fact]
        public async Task ClientLookupEndpointsReturnNonEmptyData()
        {
            SetupAdminAuthorization();

            var accessTokenTypes = await Client.GetFromJsonAsync<List<SelectItemDto>>($"{ClientsRoute}/GetAccessTokenTypes");
            accessTokenTypes.Should().NotBeNullOrEmpty();

            var tokenExpirations = await Client.GetFromJsonAsync<List<SelectItemDto>>($"{ClientsRoute}/GetTokenExpirations");
            tokenExpirations.Should().NotBeNullOrEmpty();

            var tokenUsage = await Client.GetFromJsonAsync<List<SelectItemDto>>($"{ClientsRoute}/GetTokenUsage");
            tokenUsage.Should().NotBeNullOrEmpty();

            var protocolTypes = await Client.GetFromJsonAsync<List<SelectItemDto>>($"{ClientsRoute}/GetProtocolTypes");
            protocolTypes.Should().NotBeNullOrEmpty();

            var dpopValidationModes = await Client.GetFromJsonAsync<List<SelectItemDto>>($"{ClientsRoute}/GetDPoPValidationModes");
            dpopValidationModes.Should().NotBeNullOrEmpty();

            var grantTypes = await Client.GetFromJsonAsync<List<SelectItemDto>>($"{ClientsRoute}/GetGrantTypes");
            grantTypes.Should().NotBeNullOrEmpty();

            var hashTypes = await Client.GetFromJsonAsync<List<SelectItemDto>>($"{ClientsRoute}/GetHashTypes");
            hashTypes.Should().NotBeNullOrEmpty();

            var secretTypes = await Client.GetFromJsonAsync<List<SelectItemDto>>($"{ClientsRoute}/GetSecretTypes");
            secretTypes.Should().NotBeNullOrEmpty();

            var scopes = await Client.GetFromJsonAsync<List<string>>($"{ClientsRoute}/GetScopes");
            scopes.Should().NotBeNull();

            var standardClaims = await Client.GetFromJsonAsync<List<string>>($"{ClientsRoute}/GetStandardClaims");
            standardClaims.Should().NotBeNullOrEmpty();

            var signingAlgorithms = await Client.GetFromJsonAsync<List<string>>($"{ClientsRoute}/GetSigningAlgorithms");
            signingAlgorithms.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task GetClientsWithoutPermissions()
        {
            ClearAuthorization();

            var response = await Client.GetAsync(ClientsRoute);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task ClientCreateWithoutPermissionsReturnsUnauthorized()
        {
            ClearAuthorization();
            var createRequest = BuildClientCreatePayload(UniqueValue(ClientIdPrefix));

            var response = await Client.PostAsJsonAsync(ClientsRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task ClientCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();
            var createRequest = BuildClientCreatePayload(UniqueValue(ClientIdPrefix));
            createRequest.Id = NonDefaultEntityId;

            var response = await Client.PostAsJsonAsync(ClientsRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task GetClientsSupportsSearchByClientId()
        {
            SetupAdminAuthorization();
            var uniqueClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(uniqueClientId);
                createdClientId = createdClient.Id;

                var searchRoute = BuildSearchQuery(ClientsRoute, ClientSearchParameter, uniqueClientId);
                var response = await Client.GetAsync(searchRoute);

                // Assert
                response.EnsureSuccessStatusCode();
                response.StatusCode.Should().Be(HttpStatusCode.OK);

                var clients = await response.Content.ReadFromJsonAsync<ClientsApiDto>();
                clients.Should().NotBeNull();
                clients!.Clients.Should().Contain(x => x.Id == createdClient.Id && x.ClientId == uniqueClientId);
            }
            finally
            {
                if (createdClientId > 0)
                {
                    await SafeDeleteAsync(ClientsRoute, createdClientId);
                }
            }
        }

        [Fact]
        public async Task GetClientByIdReturnsCreatedClient()
        {
            SetupAdminAuthorization();
            var uniqueClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(uniqueClientId);
                createdClientId = createdClient.Id;

                var detailResponse = await Client.GetAsync(ById(ClientsRoute, createdClientId));

                // Assert
                detailResponse.EnsureSuccessStatusCode();
                detailResponse.StatusCode.Should().Be(HttpStatusCode.OK);

                var detail = await detailResponse.Content.ReadFromJsonAsync<ClientApiDto>();
                detail.Should().NotBeNull();
                detail!.Id.Should().Be(createdClientId);
                detail.ClientId.Should().Be(uniqueClientId);
                AssertClientCreatePayloadWasPersisted(createdClient, detail);
            }
            finally
            {
                if (createdClientId > 0)
                {
                    await SafeDeleteAsync(ClientsRoute, createdClientId);
                }
            }
        }

        [Fact]
        public async Task CanInsertClientReturnsFalseForExistingAndTrueForUniqueClientId()
        {
            SetupAdminAuthorization();
            var existingClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(existingClientId);
                createdClientId = createdClient.Id;

                var existingResponse = await Client.GetAsync(
                    $"{CanInsertClientRoute}?id=0&clientId={Uri.EscapeDataString(existingClientId)}&isCloned=false");
                existingResponse.EnsureSuccessStatusCode();
                var canInsertExisting = await existingResponse.Content.ReadFromJsonAsync<bool>();

                var uniqueClientId = UniqueValue(ClientIdPrefix);
                var uniqueResponse = await Client.GetAsync(
                    $"{CanInsertClientRoute}?id=0&clientId={Uri.EscapeDataString(uniqueClientId)}&isCloned=false");
                uniqueResponse.EnsureSuccessStatusCode();
                var canInsertUnique = await uniqueResponse.Content.ReadFromJsonAsync<bool>();

                // Assert
                canInsertExisting.Should().BeFalse();
                canInsertUnique.Should().BeTrue();
            }
            finally
            {
                if (createdClientId > 0)
                {
                    await SafeDeleteAsync(ClientsRoute, createdClientId);
                }
            }
        }

        [Fact]
        public async Task ClientCreateUpdateDeleteRoundTripWorksForMachineClient()
        {
            SetupAdminAuthorization();

            var uniqueClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(uniqueClientId);
                createdClientId = createdClient.Id;

                var getResponse = await Client.GetAsync(ById(ClientsRoute, createdClientId));
                getResponse.EnsureSuccessStatusCode();
                var createdDetail = await getResponse.Content.ReadFromJsonAsync<ClientApiDto>();
                createdDetail.Should().NotBeNull();
                createdDetail!.ClientId.Should().Be(uniqueClientId);
                AssertClientCreatePayloadWasPersisted(createdClient, createdDetail);

                createdDetail.ClientName = $"{uniqueClientId}{UpdatedSuffix}";
                createdDetail.Description = UpdatedByIntegrationTest;
                createdDetail.Enabled = false;

                var updateResponse = await Client.PutAsJsonAsync(ClientsRoute, createdDetail);
                updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var getUpdatedResponse = await Client.GetAsync(ById(ClientsRoute, createdClientId));
                getUpdatedResponse.EnsureSuccessStatusCode();
                var updatedDetail = await getUpdatedResponse.Content.ReadFromJsonAsync<ClientApiDto>();
                updatedDetail.Should().NotBeNull();
                updatedDetail!.ClientName.Should().Be($"{uniqueClientId}{UpdatedSuffix}");
                updatedDetail.Description.Should().Be(UpdatedByIntegrationTest);
                updatedDetail.Enabled.Should().BeFalse();

                var deleteResponse = await Client.DeleteAsync(ById(ClientsRoute, createdClientId));
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdClientId = 0;

                var getDeletedResponse = await Client.GetAsync(ById(ClientsRoute, createdClient.Id));
                getDeletedResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                if (createdClientId > 0)
                {
                    await SafeDeleteAsync(ClientsRoute, createdClientId);
                }
            }
        }

        [Fact]
        public async Task ClientCloneCreatesNewClientFromExistingClient()
        {
            SetupAdminAuthorization();

            var sourceClientId = UniqueValue(ClientIdPrefix);
            var clonedClientIdentifier = UniqueValue(ClientIdPrefix);
            var sourceClientEntityId = 0;
            var clonedClientEntityId = 0;

            try
            {
                var sourceClient = await CreateMachineClientAsync(sourceClientId);
                sourceClientEntityId = sourceClient.Id;

                var clonePayload = BuildClientClonePayload(sourceClientEntityId, clonedClientIdentifier);
                var cloneResponse = await Client.PostAsJsonAsync($"{ClientsRoute}/{CloneRouteSegment}", clonePayload);
                cloneResponse.StatusCode.Should().Be(HttpStatusCode.Created);

                var clonedClient = await cloneResponse.Content.ReadFromJsonAsync<ClientApiDto>();
                clonedClient.Should().NotBeNull();
                clonedClientEntityId = clonedClient!.Id;
                clonedClientEntityId.Should().BeGreaterThan(0);
                clonedClientEntityId.Should().NotBe(sourceClientEntityId);
                clonedClient.ClientId.Should().NotBeNullOrWhiteSpace();

                var clonedDetailResponse = await Client.GetAsync(ById(ClientsRoute, clonedClientEntityId));
                clonedDetailResponse.EnsureSuccessStatusCode();
                var clonedDetail = await clonedDetailResponse.Content.ReadFromJsonAsync<ClientApiDto>();
                clonedDetail.Should().NotBeNull();
                clonedDetail!.ClientId.Should().NotBeNullOrWhiteSpace();
            }
            finally
            {
                await SafeDeleteAsync(ClientsRoute, clonedClientEntityId);
                await SafeDeleteAsync(ClientsRoute, sourceClientEntityId);
            }
        }

        [Fact]
        public async Task ClientSecretCreateReadDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;
            var createdSecretId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(uniqueClientId);
                createdClientId = createdClient.Id;

                var createdSecret = await CreateClientSecretAsync(createdClientId);
                createdSecretId = createdSecret.Id;

                var secretsRoute = $"{ById(ClientsRoute, createdClientId)}/{SecretsRouteSegment}";
                var listResponse = await Client.GetAsync($"{secretsRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listResponse.EnsureSuccessStatusCode();
                var secrets = await listResponse.Content.ReadFromJsonAsync<ClientSecretsApiDto>();
                secrets.Should().NotBeNull();
                secrets!.ClientSecrets.Should().Contain(x => x.Id == createdSecretId && x.Type == createdSecret.Type);

                var detailResponse = await Client.GetAsync($"{ClientsRoute}/{SecretsRouteSegment}/{createdSecretId}");
                detailResponse.EnsureSuccessStatusCode();
                var secretDetail = await detailResponse.Content.ReadFromJsonAsync<ClientSecretApiDto>();
                secretDetail.Should().NotBeNull();
                secretDetail!.Id.Should().Be(createdSecretId);
                secretDetail.Type.Should().Be(createdSecret.Type);

                var deleteResponse = await Client.DeleteAsync($"{ClientsRoute}/{SecretsRouteSegment}/{createdSecretId}");
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdSecretId = 0;

                var listAfterDeleteResponse = await Client.GetAsync($"{secretsRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listAfterDeleteResponse.EnsureSuccessStatusCode();
                var secretsAfterDelete = await listAfterDeleteResponse.Content.ReadFromJsonAsync<ClientSecretsApiDto>();
                secretsAfterDelete.Should().NotBeNull();
                secretsAfterDelete!.ClientSecrets.Should().NotContain(x => x.Id == secretDetail.Id);
            }
            finally
            {
                if (createdSecretId > 0)
                {
                    await Client.DeleteAsync($"{ClientsRoute}/{SecretsRouteSegment}/{createdSecretId}");
                }

                await SafeDeleteAsync(ClientsRoute, createdClientId);
            }
        }

        [Fact]
        public async Task ClientSecretCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();

            var uniqueClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(uniqueClientId);
                createdClientId = createdClient.Id;

                var createRequest = ClientDtoApiMock.GenerateRandomClientSecret(0);
                createRequest.Id = NonDefaultEntityId;
                // Pinned so the 400 comes from the id check, not from the JWK value validation
                createRequest.Type = SharedSecretType;
                createRequest.Value = UniqueValue(SecretValuePrefix);

                var response = await Client.PostAsJsonAsync($"{ById(ClientsRoute, createdClientId)}/{SecretsRouteSegment}", createRequest);

                response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                await SafeDeleteAsync(ClientsRoute, createdClientId);
            }
        }

        [Fact]
        public async Task ClientPropertyCreateReadDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;
            var createdPropertyId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(uniqueClientId);
                createdClientId = createdClient.Id;

                var createdProperty = await CreateClientPropertyAsync(createdClientId);
                createdPropertyId = createdProperty.Id;

                var propertiesRoute = $"{ById(ClientsRoute, createdClientId)}/{PropertiesRouteSegment}";
                var listResponse = await Client.GetAsync($"{propertiesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listResponse.EnsureSuccessStatusCode();
                var properties = await listResponse.Content.ReadFromJsonAsync<ClientPropertiesApiDto>();
                properties.Should().NotBeNull();
                properties!.ClientProperties.Should().Contain(x => x.Id == createdPropertyId && x.Key == createdProperty.Key);

                var detailResponse = await Client.GetAsync($"{ClientsRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                detailResponse.EnsureSuccessStatusCode();
                var propertyDetail = await detailResponse.Content.ReadFromJsonAsync<ClientPropertyApiDto>();
                propertyDetail.Should().NotBeNull();
                propertyDetail!.Id.Should().Be(createdPropertyId);
                propertyDetail.Key.Should().Be(createdProperty.Key);
                propertyDetail.Value.Should().Be(createdProperty.Value);

                var deleteResponse = await Client.DeleteAsync($"{ClientsRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdPropertyId = 0;

                var listAfterDeleteResponse = await Client.GetAsync($"{propertiesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listAfterDeleteResponse.EnsureSuccessStatusCode();
                var propertiesAfterDelete = await listAfterDeleteResponse.Content.ReadFromJsonAsync<ClientPropertiesApiDto>();
                propertiesAfterDelete.Should().NotBeNull();
                propertiesAfterDelete!.ClientProperties.Should().NotContain(x => x.Id == propertyDetail.Id);
            }
            finally
            {
                if (createdPropertyId > 0)
                {
                    await Client.DeleteAsync($"{ClientsRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                }

                await SafeDeleteAsync(ClientsRoute, createdClientId);
            }
        }

        [Fact]
        public async Task ClientPropertyCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();

            var uniqueClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(uniqueClientId);
                createdClientId = createdClient.Id;

                var createRequest = ClientDtoApiMock.GenerateRandomClientProperty(0);
                createRequest.Id = NonDefaultEntityId;
                createRequest.Key = UniqueValue(ClientPropertyKeyPrefix);
                createRequest.Value = UniqueValue(ClientPropertyValuePrefix);

                var response = await Client.PostAsJsonAsync($"{ById(ClientsRoute, createdClientId)}/{PropertiesRouteSegment}", createRequest);

                response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                await SafeDeleteAsync(ClientsRoute, createdClientId);
            }
        }

        [Fact]
        public async Task ClientClaimCreateReadDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;
            var createdClaimId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(uniqueClientId);
                createdClientId = createdClient.Id;

                var createdClaim = await CreateClientClaimAsync(createdClientId);
                createdClaimId = createdClaim.Id;

                var claimsRoute = $"{ById(ClientsRoute, createdClientId)}/{ClaimsRouteSegment}";
                var listResponse = await Client.GetAsync($"{claimsRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listResponse.EnsureSuccessStatusCode();
                var claims = await listResponse.Content.ReadFromJsonAsync<ClientClaimsApiDto>();
                claims.Should().NotBeNull();
                claims!.ClientClaims.Should().Contain(x => x.Id == createdClaimId && x.Type == createdClaim.Type);

                var detailResponse = await Client.GetAsync($"{ClientsRoute}/{ClaimsRouteSegment}/{createdClaimId}");
                detailResponse.EnsureSuccessStatusCode();
                var claimDetail = await detailResponse.Content.ReadFromJsonAsync<ClientClaimApiDto>();
                claimDetail.Should().NotBeNull();
                claimDetail!.Id.Should().Be(createdClaimId);
                claimDetail.Type.Should().Be(createdClaim.Type);
                claimDetail.Value.Should().Be(createdClaim.Value);

                var deleteResponse = await Client.DeleteAsync($"{ClientsRoute}/{ClaimsRouteSegment}/{createdClaimId}");
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdClaimId = 0;

                var listAfterDeleteResponse = await Client.GetAsync($"{claimsRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listAfterDeleteResponse.EnsureSuccessStatusCode();
                var claimsAfterDelete = await listAfterDeleteResponse.Content.ReadFromJsonAsync<ClientClaimsApiDto>();
                claimsAfterDelete.Should().NotBeNull();
                claimsAfterDelete!.ClientClaims.Should().NotContain(x => x.Id == claimDetail.Id);
            }
            finally
            {
                if (createdClaimId > 0)
                {
                    await Client.DeleteAsync($"{ClientsRoute}/{ClaimsRouteSegment}/{createdClaimId}");
                }

                await SafeDeleteAsync(ClientsRoute, createdClientId);
            }
        }

        [Fact]
        public async Task ClientClaimCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();

            var uniqueClientId = UniqueValue(ClientIdPrefix);
            var createdClientId = 0;

            try
            {
                var createdClient = await CreateMachineClientAsync(uniqueClientId);
                createdClientId = createdClient.Id;

                var createRequest = ClientDtoApiMock.GenerateRandomClientClaim(0);
                createRequest.Id = NonDefaultEntityId;
                createRequest.Type = UniqueValue(ClaimTypePrefix);
                createRequest.Value = UniqueValue(ClaimValuePrefix);

                var response = await Client.PostAsJsonAsync($"{ById(ClientsRoute, createdClientId)}/{ClaimsRouteSegment}", createRequest);

                response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                await SafeDeleteAsync(ClientsRoute, createdClientId);
            }
        }
    }
}
