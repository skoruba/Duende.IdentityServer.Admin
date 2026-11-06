// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Net;
using System.Net.Http.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.ApiResources;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class ApiResourcesControllerTests : AdminApiTestBase
    {
        private const string ApiResourcesRoute = "api/apiresources";
        private const string CanInsertApiResourceRoute = $"{ApiResourcesRoute}/CanInsertApiResource";
        private const string CanInsertApiResourcePropertyRoute = $"{ApiResourcesRoute}/CanInsertApiResourceProperty";
        private const string ApiResourceSearchParameter = "searchText";
        private const string ApiResourceNamePrefix = "api_resource_integration";
        private const string ApiResourcePropertyKeyPrefix = "api_resource_property_key";
        private const string ApiResourcePropertyValuePrefix = "api_resource_property_value";
        private const string ApiResourceSecretValuePrefix = "api_resource_secret_value";
        private const string SecretsRouteSegment = "secrets";
        private const string PropertiesRouteSegment = "properties";
        private const string UpdatedSuffix = "_updated";
        private const int NonDefaultEntityId = 1;

        public ApiResourcesControllerTests(TestFixture fixture) : base(fixture)
        {

        }

        internal static ApiResourceApiDto BuildApiResourceCreatePayload(string name)
        {
            var payload = ApiResourceApiDtoMock.GenerateRandomApiResource(0);
            payload.Id = 0;
            payload.Name = name;
            payload.UserClaims = DistinctStrings(payload.UserClaims);
            payload.AllowedAccessTokenSigningAlgorithms = DistinctStrings(payload.AllowedAccessTokenSigningAlgorithms);
            payload.Scopes = DistinctStrings(payload.Scopes);
            if (payload.Scopes.Count == 0)
            {
                payload.Scopes.Add($"scope_{Guid.NewGuid():N}");
            }

            return payload;
        }

        private static void AssertApiResourceCreatePayloadWasPersisted(
            ApiResourceApiDto expected,
            ApiResourceApiDto actual)
        {
            actual.Name.Should().Be(expected.Name);
            actual.DisplayName.Should().Be(expected.DisplayName);
            actual.Description.Should().Be(expected.Description);
            actual.Enabled.Should().Be(expected.Enabled);
            actual.ShowInDiscoveryDocument.Should().Be(expected.ShowInDiscoveryDocument);
            actual.RequireResourceIndicator.Should().Be(expected.RequireResourceIndicator);
            actual.UserClaims.Should().BeEquivalentTo(expected.UserClaims);
            actual.AllowedAccessTokenSigningAlgorithms.Should().BeEquivalentTo(expected.AllowedAccessTokenSigningAlgorithms);
            actual.Scopes.Should().BeEquivalentTo(expected.Scopes);
        }

        private async Task<ApiResourceApiDto> CreateApiResourceAsync(string name)
        {
            var createRequest = BuildApiResourceCreatePayload(name);

            var createResponse = await Client.PostAsJsonAsync(ApiResourcesRoute, createRequest);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var created = await createResponse.Content.ReadFromJsonAsync<ApiResourceApiDto>();
            created.Should().NotBeNull();
            created!.Id.Should().BeGreaterThan(0);
            created.Name.Should().Be(name);

            return created;
        }

        private async Task<ApiResourcePropertyApiDto> CreateApiResourcePropertyAsync(int apiResourceId)
        {
            var property = ApiResourceApiDtoMock.GenerateRandomApiResourceProperty(0);
            property.Id = 0;
            property.Key = UniqueValue(ApiResourcePropertyKeyPrefix);
            property.Value = UniqueValue(ApiResourcePropertyValuePrefix);

            var route = $"{ById(ApiResourcesRoute, apiResourceId)}/{PropertiesRouteSegment}";
            var response = await Client.PostAsJsonAsync(route, property);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var createdProperty = await response.Content.ReadFromJsonAsync<ApiResourcePropertyApiDto>();
            createdProperty.Should().NotBeNull();
            createdProperty!.Id.Should().BeGreaterThan(0);
            createdProperty.Key.Should().Be(property.Key);
            createdProperty.Value.Should().Be(property.Value);

            return createdProperty;
        }

        private async Task<ApiSecretApiDto> CreateApiSecretAsync(int apiResourceId)
        {
            var secret = ApiResourceApiDtoMock.GenerateRandomApiSecret(0);
            secret.Id = 0;
            secret.Value = UniqueValue(ApiResourceSecretValuePrefix);

            var route = $"{ById(ApiResourcesRoute, apiResourceId)}/{SecretsRouteSegment}";
            var response = await Client.PostAsJsonAsync(route, secret);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var createdSecret = await response.Content.ReadFromJsonAsync<ApiSecretApiDto>();
            createdSecret.Should().NotBeNull();
            createdSecret!.Id.Should().BeGreaterThan(0);
            createdSecret.Type.Should().Be(secret.Type);

            return createdSecret;
        }

        [Fact]
        public async Task GetApiResourcesAsAdmin()
        {
            SetupAdminAuthorization();

            var response = await Client.GetAsync(ApiResourcesRoute);

            // Assert
            response.EnsureSuccessStatusCode();
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var apiResources = await response.Content.ReadFromJsonAsync<ApiResourcesApiDto>();
            apiResources.Should().NotBeNull();
            apiResources!.ApiResources.Should().NotBeNull();
            apiResources.TotalCount.Should().BeGreaterOrEqualTo(0);
        }

        [Fact]
        public async Task GetApiResourcesWithoutPermissions()
        {
            ClearAuthorization();

            var response = await Client.GetAsync(ApiResourcesRoute);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task ApiResourceCreateWithoutPermissionsReturnsUnauthorized()
        {
            ClearAuthorization();
            var createRequest = BuildApiResourceCreatePayload(UniqueValue(ApiResourceNamePrefix));

            var response = await Client.PostAsJsonAsync(ApiResourcesRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task ApiResourceCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();
            var createRequest = BuildApiResourceCreatePayload(UniqueValue(ApiResourceNamePrefix));
            createRequest.Id = NonDefaultEntityId;

            var response = await Client.PostAsJsonAsync(ApiResourcesRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task GetApiResourcesSupportsSearchByName()
        {
            SetupAdminAuthorization();
            var uniqueName = UniqueValue(ApiResourceNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateApiResourceAsync(uniqueName);
                createdId = created.Id;

                var response = await Client.GetAsync(
                    BuildSearchQuery(ApiResourcesRoute, ApiResourceSearchParameter, uniqueName));

                // Assert
                response.EnsureSuccessStatusCode();
                response.StatusCode.Should().Be(HttpStatusCode.OK);
                var apiResources = await response.Content.ReadFromJsonAsync<ApiResourcesApiDto>();
                apiResources.Should().NotBeNull();
                apiResources!.ApiResources.Should().Contain(x => x.Id == created.Id && x.Name == uniqueName);
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(ApiResourcesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task GetApiResourceByIdReturnsCreatedApiResource()
        {
            SetupAdminAuthorization();
            var uniqueName = UniqueValue(ApiResourceNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateApiResourceAsync(uniqueName);
                createdId = created.Id;

                var detailResponse = await Client.GetAsync(ById(ApiResourcesRoute, createdId));

                // Assert
                detailResponse.EnsureSuccessStatusCode();
                detailResponse.StatusCode.Should().Be(HttpStatusCode.OK);
                var detail = await detailResponse.Content.ReadFromJsonAsync<ApiResourceApiDto>();
                detail.Should().NotBeNull();
                detail!.Id.Should().Be(createdId);
                detail.Name.Should().Be(uniqueName);
                AssertApiResourceCreatePayloadWasPersisted(created, detail);
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(ApiResourcesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task CanInsertApiResourceReturnsFalseForExistingAndTrueForUniqueName()
        {
            SetupAdminAuthorization();
            var existingName = UniqueValue(ApiResourceNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateApiResourceAsync(existingName);
                createdId = created.Id;

                var existingResponse = await Client.GetAsync(
                    $"{CanInsertApiResourceRoute}?id=0&name={Uri.EscapeDataString(existingName)}");
                existingResponse.EnsureSuccessStatusCode();
                var canInsertExisting = await existingResponse.Content.ReadFromJsonAsync<bool>();

                var uniqueName = UniqueValue(ApiResourceNamePrefix);
                var uniqueResponse = await Client.GetAsync(
                    $"{CanInsertApiResourceRoute}?id=0&name={Uri.EscapeDataString(uniqueName)}");
                uniqueResponse.EnsureSuccessStatusCode();
                var canInsertUnique = await uniqueResponse.Content.ReadFromJsonAsync<bool>();

                // Assert
                canInsertExisting.Should().BeFalse();
                canInsertUnique.Should().BeTrue();
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(ApiResourcesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task ApiResourceCreateUpdateDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(ApiResourceNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateApiResourceAsync(uniqueName);
                createdId = created.Id;

                var getResponse = await Client.GetAsync(ById(ApiResourcesRoute, createdId));
                getResponse.EnsureSuccessStatusCode();
                var createdDetail = await getResponse.Content.ReadFromJsonAsync<ApiResourceApiDto>();
                createdDetail.Should().NotBeNull();
                createdDetail!.Name.Should().Be(uniqueName);
                AssertApiResourceCreatePayloadWasPersisted(created, createdDetail);

                createdDetail.DisplayName = $"{uniqueName}{UpdatedSuffix}";
                createdDetail.Description = UpdatedByIntegrationTest;
                createdDetail.Enabled = false;

                var updateResponse = await Client.PutAsJsonAsync(ApiResourcesRoute, createdDetail);
                updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var getUpdatedResponse = await Client.GetAsync(ById(ApiResourcesRoute, createdId));
                getUpdatedResponse.EnsureSuccessStatusCode();
                var updatedDetail = await getUpdatedResponse.Content.ReadFromJsonAsync<ApiResourceApiDto>();
                updatedDetail.Should().NotBeNull();
                updatedDetail!.DisplayName.Should().Be($"{uniqueName}{UpdatedSuffix}");
                updatedDetail.Description.Should().Be(UpdatedByIntegrationTest);
                updatedDetail.Enabled.Should().BeFalse();

                var deleteResponse = await Client.DeleteAsync(ById(ApiResourcesRoute, createdId));
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdId = 0;

                var getDeletedResponse = await Client.GetAsync(ById(ApiResourcesRoute, created.Id));
                getDeletedResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(ApiResourcesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task ApiResourcePropertyCanInsertCreateReadDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(ApiResourceNamePrefix);
            var createdApiResourceId = 0;
            var createdPropertyId = 0;

            try
            {
                var createdApiResource = await CreateApiResourceAsync(uniqueName);
                createdApiResourceId = createdApiResource.Id;

                var createdProperty = await CreateApiResourcePropertyAsync(createdApiResourceId);
                createdPropertyId = createdProperty.Id;

                var canInsertExistingResponse = await Client.GetAsync(
                    $"{CanInsertApiResourcePropertyRoute}?id={createdApiResourceId}&key={Uri.EscapeDataString(createdProperty.Key)}");
                canInsertExistingResponse.EnsureSuccessStatusCode();
                var canInsertExisting = await canInsertExistingResponse.Content.ReadFromJsonAsync<bool>();
                canInsertExisting.Should().BeFalse();

                var uniqueKey = UniqueValue(ApiResourcePropertyKeyPrefix);
                var canInsertUniqueResponse = await Client.GetAsync(
                    $"{CanInsertApiResourcePropertyRoute}?id={createdApiResourceId}&key={Uri.EscapeDataString(uniqueKey)}");
                canInsertUniqueResponse.EnsureSuccessStatusCode();
                var canInsertUnique = await canInsertUniqueResponse.Content.ReadFromJsonAsync<bool>();
                canInsertUnique.Should().BeTrue();

                var propertiesRoute = $"{ById(ApiResourcesRoute, createdApiResourceId)}/{PropertiesRouteSegment}";
                var listResponse = await Client.GetAsync($"{propertiesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listResponse.EnsureSuccessStatusCode();
                var properties = await listResponse.Content.ReadFromJsonAsync<ApiResourcePropertiesApiDto>();
                properties.Should().NotBeNull();
                properties!.ApiResourceProperties.Should().Contain(x => x.Id == createdPropertyId && x.Key == createdProperty.Key);

                var detailResponse = await Client.GetAsync($"{ApiResourcesRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                detailResponse.EnsureSuccessStatusCode();
                var propertyDetail = await detailResponse.Content.ReadFromJsonAsync<ApiResourcePropertyApiDto>();
                propertyDetail.Should().NotBeNull();
                propertyDetail!.Id.Should().Be(createdPropertyId);
                propertyDetail.Key.Should().Be(createdProperty.Key);
                propertyDetail.Value.Should().Be(createdProperty.Value);

                var deleteResponse = await Client.DeleteAsync($"{ApiResourcesRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdPropertyId = 0;

                var listAfterDeleteResponse = await Client.GetAsync($"{propertiesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listAfterDeleteResponse.EnsureSuccessStatusCode();
                var propertiesAfterDelete = await listAfterDeleteResponse.Content.ReadFromJsonAsync<ApiResourcePropertiesApiDto>();
                propertiesAfterDelete.Should().NotBeNull();
                propertiesAfterDelete!.ApiResourceProperties.Should().NotContain(x => x.Id == propertyDetail.Id);
            }
            finally
            {
                if (createdPropertyId > 0)
                {
                    await Client.DeleteAsync($"{ApiResourcesRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                }

                await SafeDeleteAsync(ApiResourcesRoute, createdApiResourceId);
            }
        }

        [Fact]
        public async Task ApiResourcePropertyCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(ApiResourceNamePrefix);
            var createdApiResourceId = 0;

            try
            {
                var createdApiResource = await CreateApiResourceAsync(uniqueName);
                createdApiResourceId = createdApiResource.Id;

                var createRequest = ApiResourceApiDtoMock.GenerateRandomApiResourceProperty(0);
                createRequest.Id = NonDefaultEntityId;
                createRequest.Key = UniqueValue(ApiResourcePropertyKeyPrefix);
                createRequest.Value = UniqueValue(ApiResourcePropertyValuePrefix);

                var response = await Client.PostAsJsonAsync(
                    $"{ById(ApiResourcesRoute, createdApiResourceId)}/{PropertiesRouteSegment}",
                    createRequest);

                response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                await SafeDeleteAsync(ApiResourcesRoute, createdApiResourceId);
            }
        }

        [Fact]
        public async Task ApiResourceSecretCreateReadDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(ApiResourceNamePrefix);
            var createdApiResourceId = 0;
            var createdSecretId = 0;

            try
            {
                var createdApiResource = await CreateApiResourceAsync(uniqueName);
                createdApiResourceId = createdApiResource.Id;

                var createdSecret = await CreateApiSecretAsync(createdApiResourceId);
                createdSecretId = createdSecret.Id;

                var secretsRoute = $"{ById(ApiResourcesRoute, createdApiResourceId)}/{SecretsRouteSegment}";
                var listResponse = await Client.GetAsync($"{secretsRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listResponse.EnsureSuccessStatusCode();
                var secrets = await listResponse.Content.ReadFromJsonAsync<ApiSecretsApiDto>();
                secrets.Should().NotBeNull();
                secrets!.ApiSecrets.Should().Contain(x => x.Id == createdSecretId && x.Type == createdSecret.Type);

                var detailResponse = await Client.GetAsync($"{ApiResourcesRoute}/{SecretsRouteSegment}/{createdSecretId}");
                detailResponse.EnsureSuccessStatusCode();
                var secretDetail = await detailResponse.Content.ReadFromJsonAsync<ApiSecretApiDto>();
                secretDetail.Should().NotBeNull();
                secretDetail!.Id.Should().Be(createdSecretId);
                secretDetail.Type.Should().Be(createdSecret.Type);

                var deleteResponse = await Client.DeleteAsync($"{ApiResourcesRoute}/{SecretsRouteSegment}/{createdSecretId}");
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdSecretId = 0;

                var listAfterDeleteResponse = await Client.GetAsync($"{secretsRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listAfterDeleteResponse.EnsureSuccessStatusCode();
                var secretsAfterDelete = await listAfterDeleteResponse.Content.ReadFromJsonAsync<ApiSecretsApiDto>();
                secretsAfterDelete.Should().NotBeNull();
                secretsAfterDelete!.ApiSecrets.Should().NotContain(x => x.Id == secretDetail.Id);
            }
            finally
            {
                if (createdSecretId > 0)
                {
                    await Client.DeleteAsync($"{ApiResourcesRoute}/{SecretsRouteSegment}/{createdSecretId}");
                }

                await SafeDeleteAsync(ApiResourcesRoute, createdApiResourceId);
            }
        }

        [Fact]
        public async Task ApiResourceSecretCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(ApiResourceNamePrefix);
            var createdApiResourceId = 0;

            try
            {
                var createdApiResource = await CreateApiResourceAsync(uniqueName);
                createdApiResourceId = createdApiResource.Id;

                var createRequest = ApiResourceApiDtoMock.GenerateRandomApiSecret(0);
                createRequest.Id = NonDefaultEntityId;
                createRequest.Value = UniqueValue(ApiResourceSecretValuePrefix);

                var response = await Client.PostAsJsonAsync(
                    $"{ById(ApiResourcesRoute, createdApiResourceId)}/{SecretsRouteSegment}",
                    createRequest);

                response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                await SafeDeleteAsync(ApiResourcesRoute, createdApiResourceId);
            }
        }
    }
}
