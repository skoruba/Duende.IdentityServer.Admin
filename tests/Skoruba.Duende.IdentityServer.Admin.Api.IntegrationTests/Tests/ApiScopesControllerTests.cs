// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.ApiScopes;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class ApiScopesControllerTests : AdminApiTestBase
    {
        private const string ApiScopesRoute = "api/apiscopes";
        private const string CanInsertApiScopeRoute = $"{ApiScopesRoute}/CanInsertApiScope";
        private const string CanInsertApiScopePropertyRoute = $"{ApiScopesRoute}/CanInsertApiScopeProperty";
        private const string ApiScopeSearchParameter = "search";
        private const string ApiScopeNamePrefix = "api_scope_integration";
        private const string ApiScopePropertyKeyPrefix = "api_scope_property_key";
        private const string ApiScopePropertyValuePrefix = "api_scope_property_value";
        private const string PropertiesRouteSegment = "properties";
        private const string DefaultScopeClaim = "role";
        private const string UpdatedSuffix = "_updated";
        private const int NonDefaultEntityId = 1;

        public ApiScopesControllerTests(TestFixture fixture) : base(fixture)
        {
        }

        internal static ApiScopeApiDto BuildApiScopeCreatePayload(string name)
        {
            var payload = ApiScopeApiDtoMock.GenerateRandomApiScope(0);
            payload.Id = 0;
            payload.Name = name;
            payload.UserClaims = DistinctStrings(payload.UserClaims);
            if (payload.UserClaims.Count == 0)
            {
                payload.UserClaims.Add(DefaultScopeClaim);
            }

            return payload;
        }

        private static void AssertApiScopeCreatePayloadWasPersisted(
            ApiScopeApiDto expected,
            ApiScopeApiDto actual)
        {
            actual.Name.Should().Be(expected.Name);
            actual.DisplayName.Should().Be(expected.DisplayName);
            actual.Description.Should().Be(expected.Description);
            actual.Enabled.Should().Be(expected.Enabled);
            actual.ShowInDiscoveryDocument.Should().Be(expected.ShowInDiscoveryDocument);
            actual.Required.Should().Be(expected.Required);
            actual.Emphasize.Should().Be(expected.Emphasize);
            actual.UserClaims.Should().BeEquivalentTo(expected.UserClaims);
        }

        private async Task<ApiScopeApiDto> CreateApiScopeAsync(string name)
        {
            var createRequest = BuildApiScopeCreatePayload(name);

            var createResponse = await Client.PostAsJsonAsync(ApiScopesRoute, createRequest);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var created = await createResponse.Content.ReadFromJsonAsync<ApiScopeApiDto>();
            created.Should().NotBeNull();
            created!.Id.Should().BeGreaterThan(0);
            created.Name.Should().Be(name);

            return created;
        }

        private async Task<ApiScopePropertyApiDto> CreateApiScopePropertyAsync(int apiScopeId)
        {
            var property = ApiScopeApiDtoMock.GenerateRandomApiScopeProperty(0);
            property.Id = 0;
            property.Key = UniqueValue(ApiScopePropertyKeyPrefix);
            property.Value = UniqueValue(ApiScopePropertyValuePrefix);

            var route = $"{ById(ApiScopesRoute, apiScopeId)}/{PropertiesRouteSegment}";
            var response = await Client.PostAsJsonAsync(route, property);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var createdProperty = await response.Content.ReadFromJsonAsync<ApiScopePropertyApiDto>();
            createdProperty.Should().NotBeNull();
            createdProperty!.Id.Should().BeGreaterThan(0);
            createdProperty.Key.Should().Be(property.Key);
            createdProperty.Value.Should().Be(property.Value);

            return createdProperty;
        }

        [Fact]
        public async Task GetApiScopesAsAdmin()
        {
            SetupAdminAuthorization();

            var response = await Client.GetAsync(ApiScopesRoute);

            // Assert
            response.EnsureSuccessStatusCode();
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var apiScopes = await response.Content.ReadFromJsonAsync<ApiScopesApiDto>();
            apiScopes.Should().NotBeNull();
            apiScopes!.Scopes.Should().NotBeNull();
            apiScopes.TotalCount.Should().BeGreaterOrEqualTo(0);
        }

        [Fact]
        public async Task GetApiScopesWithoutPermissions()
        {
            ClearAuthorization();

            var response = await Client.GetAsync(ApiScopesRoute);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task ApiScopeCreateWithoutPermissionsReturnsUnauthorized()
        {
            ClearAuthorization();
            var createRequest = BuildApiScopeCreatePayload(UniqueValue(ApiScopeNamePrefix));

            var response = await Client.PostAsJsonAsync(ApiScopesRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task ApiScopeCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();
            var createRequest = BuildApiScopeCreatePayload(UniqueValue(ApiScopeNamePrefix));
            createRequest.Id = NonDefaultEntityId;

            var response = await Client.PostAsJsonAsync(ApiScopesRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task GetApiScopesSupportsSearchByName()
        {
            SetupAdminAuthorization();
            var uniqueName = UniqueValue(ApiScopeNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateApiScopeAsync(uniqueName);
                createdId = created.Id;

                var response = await Client.GetAsync(BuildSearchQuery(ApiScopesRoute, ApiScopeSearchParameter, uniqueName));

                // Assert
                response.EnsureSuccessStatusCode();
                response.StatusCode.Should().Be(HttpStatusCode.OK);
                var apiScopes = await response.Content.ReadFromJsonAsync<ApiScopesApiDto>();
                apiScopes.Should().NotBeNull();
                apiScopes!.Scopes.Should().Contain(x => x.Id == created.Id && x.Name == uniqueName);
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(ApiScopesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task GetApiScopeByIdReturnsCreatedApiScope()
        {
            SetupAdminAuthorization();
            var uniqueName = UniqueValue(ApiScopeNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateApiScopeAsync(uniqueName);
                createdId = created.Id;

                var detailResponse = await Client.GetAsync(ById(ApiScopesRoute, createdId));

                // Assert
                detailResponse.EnsureSuccessStatusCode();
                detailResponse.StatusCode.Should().Be(HttpStatusCode.OK);
                var detail = await detailResponse.Content.ReadFromJsonAsync<ApiScopeApiDto>();
                detail.Should().NotBeNull();
                detail!.Id.Should().Be(createdId);
                detail.Name.Should().Be(uniqueName);
                AssertApiScopeCreatePayloadWasPersisted(created, detail);
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(ApiScopesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task CanInsertApiScopeReturnsFalseForExistingAndTrueForUniqueName()
        {
            SetupAdminAuthorization();
            var existingName = UniqueValue(ApiScopeNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateApiScopeAsync(existingName);
                createdId = created.Id;

                var existingResponse = await Client.GetAsync(
                    $"{CanInsertApiScopeRoute}?id=0&name={Uri.EscapeDataString(existingName)}");
                existingResponse.EnsureSuccessStatusCode();
                var canInsertExisting = await existingResponse.Content.ReadFromJsonAsync<bool>();

                var uniqueName = UniqueValue(ApiScopeNamePrefix);
                var uniqueResponse = await Client.GetAsync(
                    $"{CanInsertApiScopeRoute}?id=0&name={Uri.EscapeDataString(uniqueName)}");
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
                    await SafeDeleteAsync(ApiScopesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task ApiScopeCreateUpdateDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(ApiScopeNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateApiScopeAsync(uniqueName);
                createdId = created.Id;

                var getResponse = await Client.GetAsync(ById(ApiScopesRoute, createdId));
                getResponse.EnsureSuccessStatusCode();
                var createdDetail = await getResponse.Content.ReadFromJsonAsync<ApiScopeApiDto>();
                createdDetail.Should().NotBeNull();
                createdDetail!.Name.Should().Be(uniqueName);
                AssertApiScopeCreatePayloadWasPersisted(created, createdDetail);

                createdDetail.DisplayName = $"{uniqueName}{UpdatedSuffix}";
                createdDetail.Description = UpdatedByIntegrationTest;
                createdDetail.Enabled = false;
                createdDetail.Required = true;
                createdDetail.Emphasize = true;

                var updateResponse = await Client.PutAsJsonAsync(ApiScopesRoute, createdDetail);
                updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var getUpdatedResponse = await Client.GetAsync(ById(ApiScopesRoute, createdId));
                getUpdatedResponse.EnsureSuccessStatusCode();
                var updatedDetail = await getUpdatedResponse.Content.ReadFromJsonAsync<ApiScopeApiDto>();
                updatedDetail.Should().NotBeNull();
                updatedDetail!.DisplayName.Should().Be($"{uniqueName}{UpdatedSuffix}");
                updatedDetail.Description.Should().Be(UpdatedByIntegrationTest);
                updatedDetail.Enabled.Should().BeFalse();
                updatedDetail.Required.Should().BeTrue();
                updatedDetail.Emphasize.Should().BeTrue();

                var deleteResponse = await Client.DeleteAsync(ById(ApiScopesRoute, createdId));
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdId = 0;

                var getDeletedResponse = await Client.GetAsync(ById(ApiScopesRoute, created.Id));
                getDeletedResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(ApiScopesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task ApiScopePropertyCanInsertCreateReadDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(ApiScopeNamePrefix);
            var createdApiScopeId = 0;
            var createdPropertyId = 0;

            try
            {
                var createdApiScope = await CreateApiScopeAsync(uniqueName);
                createdApiScopeId = createdApiScope.Id;

                var createdProperty = await CreateApiScopePropertyAsync(createdApiScopeId);
                createdPropertyId = createdProperty.Id;

                var canInsertExistingResponse = await Client.GetAsync(
                    $"{CanInsertApiScopePropertyRoute}?id={createdApiScopeId}&key={Uri.EscapeDataString(createdProperty.Key)}");
                canInsertExistingResponse.EnsureSuccessStatusCode();
                var canInsertExisting = await canInsertExistingResponse.Content.ReadFromJsonAsync<bool>();
                canInsertExisting.Should().BeFalse();

                var uniqueKey = UniqueValue(ApiScopePropertyKeyPrefix);
                var canInsertUniqueResponse = await Client.GetAsync(
                    $"{CanInsertApiScopePropertyRoute}?id={createdApiScopeId}&key={Uri.EscapeDataString(uniqueKey)}");
                canInsertUniqueResponse.EnsureSuccessStatusCode();
                var canInsertUnique = await canInsertUniqueResponse.Content.ReadFromJsonAsync<bool>();
                canInsertUnique.Should().BeTrue();

                var propertiesRoute = $"{ById(ApiScopesRoute, createdApiScopeId)}/{PropertiesRouteSegment}";
                var listResponse = await Client.GetAsync($"{propertiesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listResponse.EnsureSuccessStatusCode();
                var properties = await listResponse.Content.ReadFromJsonAsync<ApiScopePropertiesApiDto>();
                properties.Should().NotBeNull();
                properties!.ApiScopeProperties.Should().Contain(x => x.Id == createdPropertyId && x.Key == createdProperty.Key);

                var detailResponse = await Client.GetAsync($"{ApiScopesRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                detailResponse.EnsureSuccessStatusCode();
                var propertyDetail = await detailResponse.Content.ReadFromJsonAsync<ApiScopePropertyApiDto>();
                propertyDetail.Should().NotBeNull();
                propertyDetail!.Id.Should().Be(createdPropertyId);
                propertyDetail.Key.Should().Be(createdProperty.Key);
                propertyDetail.Value.Should().Be(createdProperty.Value);

                var deleteResponse = await Client.DeleteAsync($"{ApiScopesRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdPropertyId = 0;

                var listAfterDeleteResponse = await Client.GetAsync($"{propertiesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listAfterDeleteResponse.EnsureSuccessStatusCode();
                var propertiesAfterDelete = await listAfterDeleteResponse.Content.ReadFromJsonAsync<ApiScopePropertiesApiDto>();
                propertiesAfterDelete.Should().NotBeNull();
                propertiesAfterDelete!.ApiScopeProperties.Should().NotContain(x => x.Id == propertyDetail.Id);
            }
            finally
            {
                if (createdPropertyId > 0)
                {
                    await Client.DeleteAsync($"{ApiScopesRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                }

                await SafeDeleteAsync(ApiScopesRoute, createdApiScopeId);
            }
        }

        [Fact]
        public async Task ApiScopePropertyCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(ApiScopeNamePrefix);
            var createdApiScopeId = 0;

            try
            {
                var createdApiScope = await CreateApiScopeAsync(uniqueName);
                createdApiScopeId = createdApiScope.Id;

                var createRequest = ApiScopeApiDtoMock.GenerateRandomApiScopeProperty(0);
                createRequest.Id = NonDefaultEntityId;
                createRequest.Key = UniqueValue(ApiScopePropertyKeyPrefix);
                createRequest.Value = UniqueValue(ApiScopePropertyValuePrefix);

                var response = await Client.PostAsJsonAsync(
                    $"{ById(ApiScopesRoute, createdApiScopeId)}/{PropertiesRouteSegment}",
                    createRequest);

                response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                await SafeDeleteAsync(ApiScopesRoute, createdApiScopeId);
            }
        }
    }
}
