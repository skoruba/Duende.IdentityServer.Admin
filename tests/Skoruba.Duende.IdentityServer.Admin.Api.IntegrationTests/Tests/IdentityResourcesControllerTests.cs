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
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.IdentityResources;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class IdentityResourcesControllerTests : AdminApiTestBase
    {
        private const string IdentityResourcesRoute = "api/identityresources";
        private const string CanInsertIdentityResourceRoute = $"{IdentityResourcesRoute}/CanInsertIdentityResource";
        private const string CanInsertIdentityResourcePropertyRoute = $"{IdentityResourcesRoute}/CanInsertIdentityResourceProperty";
        private const string IdentityResourceSearchParameter = "searchText";
        private const string IdentityResourceNamePrefix = "identity_resource_integration";
        private const string IdentityResourcePropertyKeyPrefix = "identity_resource_property_key";
        private const string IdentityResourcePropertyValuePrefix = "identity_resource_property_value";
        private const string PropertiesRouteSegment = "properties";
        private const string DefaultIdentityClaim = "sub";
        private const string UpdatedSuffix = "_updated";
        private const int NonDefaultEntityId = 1;

        public IdentityResourcesControllerTests(TestFixture fixture) : base(fixture)
        {
        }

        internal static IdentityResourceApiDto BuildIdentityResourceCreatePayload(string name)
        {
            var payload = IdentityResourceApiDtoMock.GenerateRandomIdentityResource(0);
            payload.Id = 0;
            payload.Name = name;
            payload.UserClaims = DistinctStrings(payload.UserClaims);
            if (payload.UserClaims.Count == 0)
            {
                payload.UserClaims.Add(DefaultIdentityClaim);
            }

            return payload;
        }

        private static void AssertIdentityResourceCreatePayloadWasPersisted(
            IdentityResourceApiDto expected,
            IdentityResourceApiDto actual)
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

        private async Task<IdentityResourceApiDto> CreateIdentityResourceAsync(string name)
        {
            var createRequest = BuildIdentityResourceCreatePayload(name);

            var createResponse = await Client.PostAsJsonAsync(IdentityResourcesRoute, createRequest);
            createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var created = await createResponse.Content.ReadFromJsonAsync<IdentityResourceApiDto>();
            created.Should().NotBeNull();
            created!.Id.Should().BeGreaterThan(0);
            created.Name.Should().Be(name);

            return created;
        }

        private async Task<IdentityResourcePropertyApiDto> CreateIdentityResourcePropertyAsync(int identityResourceId)
        {
            var property = IdentityResourceApiDtoMock.GenerateRandomIdentityResourceProperty(0);
            property.Id = 0;
            property.Key = UniqueValue(IdentityResourcePropertyKeyPrefix);
            property.Value = UniqueValue(IdentityResourcePropertyValuePrefix);

            var route = $"{ById(IdentityResourcesRoute, identityResourceId)}/{PropertiesRouteSegment}";
            var response = await Client.PostAsJsonAsync(route, property);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var createdProperty = await response.Content.ReadFromJsonAsync<IdentityResourcePropertyApiDto>();
            createdProperty.Should().NotBeNull();
            createdProperty!.Id.Should().BeGreaterThan(0);
            createdProperty.Key.Should().Be(property.Key);
            createdProperty.Value.Should().Be(property.Value);

            return createdProperty;
        }

        [Fact]
        public async Task GetIdentityResourcesAsAdmin()
        {
            SetupAdminAuthorization();

            var response = await Client.GetAsync(IdentityResourcesRoute);

            // Assert
            response.EnsureSuccessStatusCode();
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var identityResources = await response.Content.ReadFromJsonAsync<IdentityResourcesApiDto>();
            identityResources.Should().NotBeNull();
            identityResources!.IdentityResources.Should().NotBeNull();
            identityResources.TotalCount.Should().BeGreaterOrEqualTo(0);
        }

        [Fact]
        public async Task GetIdentityResourcesWithoutPermissions()
        {
            ClearAuthorization();

            var response = await Client.GetAsync(IdentityResourcesRoute);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task IdentityResourceCreateWithoutPermissionsReturnsUnauthorized()
        {
            ClearAuthorization();
            var createRequest = BuildIdentityResourceCreatePayload(UniqueValue(IdentityResourceNamePrefix));

            var response = await Client.PostAsJsonAsync(IdentityResourcesRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task IdentityResourceCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();
            var createRequest = BuildIdentityResourceCreatePayload(UniqueValue(IdentityResourceNamePrefix));
            createRequest.Id = NonDefaultEntityId;

            var response = await Client.PostAsJsonAsync(IdentityResourcesRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task GetIdentityResourcesSupportsSearchByName()
        {
            SetupAdminAuthorization();
            var uniqueName = UniqueValue(IdentityResourceNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateIdentityResourceAsync(uniqueName);
                createdId = created.Id;

                var response = await Client.GetAsync(
                    BuildSearchQuery(IdentityResourcesRoute, IdentityResourceSearchParameter, uniqueName));

                // Assert
                response.EnsureSuccessStatusCode();
                response.StatusCode.Should().Be(HttpStatusCode.OK);

                var identityResources = await response.Content.ReadFromJsonAsync<IdentityResourcesApiDto>();
                identityResources.Should().NotBeNull();
                identityResources!.IdentityResources.Should().Contain(x => x.Id == created.Id && x.Name == uniqueName);
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(IdentityResourcesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task GetIdentityResourceByIdReturnsCreatedIdentityResource()
        {
            SetupAdminAuthorization();
            var uniqueName = UniqueValue(IdentityResourceNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateIdentityResourceAsync(uniqueName);
                createdId = created.Id;

                var detailResponse = await Client.GetAsync(ById(IdentityResourcesRoute, createdId));

                // Assert
                detailResponse.EnsureSuccessStatusCode();
                detailResponse.StatusCode.Should().Be(HttpStatusCode.OK);
                var detail = await detailResponse.Content.ReadFromJsonAsync<IdentityResourceApiDto>();
                detail.Should().NotBeNull();
                detail!.Id.Should().Be(createdId);
                detail.Name.Should().Be(uniqueName);
                AssertIdentityResourceCreatePayloadWasPersisted(created, detail);
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(IdentityResourcesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task CanInsertIdentityResourceReturnsFalseForExistingAndTrueForUniqueName()
        {
            SetupAdminAuthorization();
            var existingName = UniqueValue(IdentityResourceNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateIdentityResourceAsync(existingName);
                createdId = created.Id;

                var existingResponse = await Client.GetAsync(
                    $"{CanInsertIdentityResourceRoute}?id=0&name={Uri.EscapeDataString(existingName)}");
                existingResponse.EnsureSuccessStatusCode();
                var canInsertExisting = await existingResponse.Content.ReadFromJsonAsync<bool>();

                var uniqueName = UniqueValue(IdentityResourceNamePrefix);
                var uniqueResponse = await Client.GetAsync(
                    $"{CanInsertIdentityResourceRoute}?id=0&name={Uri.EscapeDataString(uniqueName)}");
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
                    await SafeDeleteAsync(IdentityResourcesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task IdentityResourceCreateUpdateDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(IdentityResourceNamePrefix);
            var createdId = 0;

            try
            {
                var created = await CreateIdentityResourceAsync(uniqueName);
                createdId = created.Id;

                var getResponse = await Client.GetAsync(ById(IdentityResourcesRoute, createdId));
                getResponse.EnsureSuccessStatusCode();
                var createdDetail = await getResponse.Content.ReadFromJsonAsync<IdentityResourceApiDto>();
                createdDetail.Should().NotBeNull();
                createdDetail!.Name.Should().Be(uniqueName);
                AssertIdentityResourceCreatePayloadWasPersisted(created, createdDetail);

                createdDetail.DisplayName = $"{uniqueName}{UpdatedSuffix}";
                createdDetail.Description = UpdatedByIntegrationTest;
                createdDetail.Enabled = false;
                createdDetail.Required = true;
                createdDetail.Emphasize = true;

                var updateResponse = await Client.PutAsJsonAsync(IdentityResourcesRoute, createdDetail);
                updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var getUpdatedResponse = await Client.GetAsync(ById(IdentityResourcesRoute, createdId));
                getUpdatedResponse.EnsureSuccessStatusCode();
                var updatedDetail = await getUpdatedResponse.Content.ReadFromJsonAsync<IdentityResourceApiDto>();
                updatedDetail.Should().NotBeNull();
                updatedDetail!.DisplayName.Should().Be($"{uniqueName}{UpdatedSuffix}");
                updatedDetail.Description.Should().Be(UpdatedByIntegrationTest);
                updatedDetail.Enabled.Should().BeFalse();
                updatedDetail.Required.Should().BeTrue();
                updatedDetail.Emphasize.Should().BeTrue();

                var deleteResponse = await Client.DeleteAsync(ById(IdentityResourcesRoute, createdId));
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdId = 0;

                var getDeletedResponse = await Client.GetAsync(ById(IdentityResourcesRoute, created.Id));
                getDeletedResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                if (createdId > 0)
                {
                    await SafeDeleteAsync(IdentityResourcesRoute, createdId);
                }
            }
        }

        [Fact]
        public async Task IdentityResourcePropertyCanInsertCreateReadDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(IdentityResourceNamePrefix);
            var createdIdentityResourceId = 0;
            var createdPropertyId = 0;

            try
            {
                var createdIdentityResource = await CreateIdentityResourceAsync(uniqueName);
                createdIdentityResourceId = createdIdentityResource.Id;

                var createdProperty = await CreateIdentityResourcePropertyAsync(createdIdentityResourceId);
                createdPropertyId = createdProperty.Id;

                var canInsertExistingResponse = await Client.GetAsync(
                    $"{CanInsertIdentityResourcePropertyRoute}?id={createdIdentityResourceId}&key={Uri.EscapeDataString(createdProperty.Key)}");
                canInsertExistingResponse.EnsureSuccessStatusCode();
                var canInsertExisting = await canInsertExistingResponse.Content.ReadFromJsonAsync<bool>();
                canInsertExisting.Should().BeFalse();

                var uniqueKey = UniqueValue(IdentityResourcePropertyKeyPrefix);
                var canInsertUniqueResponse = await Client.GetAsync(
                    $"{CanInsertIdentityResourcePropertyRoute}?id={createdIdentityResourceId}&key={Uri.EscapeDataString(uniqueKey)}");
                canInsertUniqueResponse.EnsureSuccessStatusCode();
                var canInsertUnique = await canInsertUniqueResponse.Content.ReadFromJsonAsync<bool>();
                canInsertUnique.Should().BeTrue();

                var propertiesRoute = $"{ById(IdentityResourcesRoute, createdIdentityResourceId)}/{PropertiesRouteSegment}";
                var listResponse = await Client.GetAsync($"{propertiesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listResponse.EnsureSuccessStatusCode();
                var properties = await listResponse.Content.ReadFromJsonAsync<IdentityResourcePropertiesApiDto>();
                properties.Should().NotBeNull();
                properties!.IdentityResourceProperties.Should().Contain(x => x.Id == createdPropertyId && x.Key == createdProperty.Key);

                var detailResponse = await Client.GetAsync($"{IdentityResourcesRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                detailResponse.EnsureSuccessStatusCode();
                var propertyDetail = await detailResponse.Content.ReadFromJsonAsync<IdentityResourcePropertyApiDto>();
                propertyDetail.Should().NotBeNull();
                propertyDetail!.Id.Should().Be(createdPropertyId);
                propertyDetail.Key.Should().Be(createdProperty.Key);
                propertyDetail.Value.Should().Be(createdProperty.Value);

                var deleteResponse = await Client.DeleteAsync($"{IdentityResourcesRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdPropertyId = 0;

                var listAfterDeleteResponse = await Client.GetAsync($"{propertiesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                listAfterDeleteResponse.EnsureSuccessStatusCode();
                var propertiesAfterDelete = await listAfterDeleteResponse.Content.ReadFromJsonAsync<IdentityResourcePropertiesApiDto>();
                propertiesAfterDelete.Should().NotBeNull();
                propertiesAfterDelete!.IdentityResourceProperties.Should().NotContain(x => x.Id == propertyDetail.Id);
            }
            finally
            {
                if (createdPropertyId > 0)
                {
                    await Client.DeleteAsync($"{IdentityResourcesRoute}/{PropertiesRouteSegment}/{createdPropertyId}");
                }

                await SafeDeleteAsync(IdentityResourcesRoute, createdIdentityResourceId);
            }
        }

        [Fact]
        public async Task IdentityResourcePropertyCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();

            var uniqueName = UniqueValue(IdentityResourceNamePrefix);
            var createdIdentityResourceId = 0;

            try
            {
                var createdIdentityResource = await CreateIdentityResourceAsync(uniqueName);
                createdIdentityResourceId = createdIdentityResource.Id;

                var createRequest = IdentityResourceApiDtoMock.GenerateRandomIdentityResourceProperty(0);
                createRequest.Id = NonDefaultEntityId;
                createRequest.Key = UniqueValue(IdentityResourcePropertyKeyPrefix);
                createRequest.Value = UniqueValue(IdentityResourcePropertyValuePrefix);

                var response = await Client.PostAsJsonAsync(
                    $"{ById(IdentityResourcesRoute, createdIdentityResourceId)}/{PropertiesRouteSegment}",
                    createRequest);

                response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                await SafeDeleteAsync(IdentityResourcesRoute, createdIdentityResourceId);
            }
        }
    }
}
