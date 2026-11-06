// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.ApiResources;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.ApiScopes;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Clients;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.IdentityResources;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class ScopeUsageTests : AdminApiTestBase
    {
        private const string ApiScopesRoute = "api/apiscopes";
        private const string IdentityResourcesRoute = "api/identityresources";
        private const string ApiResourcesRoute = "api/apiresources";
        private const string ClientsRoute = "api/clients";
        private const string ClientCountsByScopesRoute = $"{ClientsRoute}/GetClientCountsByScopes";
        private const string ClientsRouteSegment = "clients";
        private const string ApiResourcesRouteSegment = "apiresources";
        private const int MissingEntityId = int.MaxValue;

        public ScopeUsageTests(TestFixture fixture) : base(fixture)
        {
        }

        private async Task<TResponse> PostAsync<TRequest, TResponse>(string route, TRequest request)
        {
            var response = await Client.PostAsJsonAsync(route, request);
            response.StatusCode.Should().Be(HttpStatusCode.Created);

            var created = await response.Content.ReadFromJsonAsync<TResponse>();
            created.Should().NotBeNull();

            return created!;
        }

        private Task<ClientApiDto> CreateClientAsync(string scope, bool enabled = true)
        {
            var payload = ClientsControllerTests.BuildClientCreatePayload(UniqueValue("scope_usage_client"));
            payload.AllowedScopes = new List<string> { scope };
            payload.Enabled = enabled;

            return PostAsync<ClientApiDto, ClientApiDto>(ClientsRoute, payload);
        }

        [Fact]
        public async Task GetApiScopeClientsReturnsClientsAllowingTheScope()
        {
            SetupAdminAuthorization();
            var apiScopeId = 0;
            var clientIds = new List<int>();

            try
            {
                var apiScope = await PostAsync<ApiScopeApiDto, ApiScopeApiDto>(ApiScopesRoute,
                    ApiScopesControllerTests.BuildApiScopeCreatePayload(UniqueValue("scope_usage_api_scope")));
                apiScopeId = apiScope.Id;

                var enabledClient = await CreateClientAsync(apiScope.Name);
                clientIds.Add(enabledClient.Id);
                var disabledClient = await CreateClientAsync(apiScope.Name, enabled: false);
                clientIds.Add(disabledClient.Id);
                var otherClient = await CreateClientAsync($"{apiScope.Name}_other");
                clientIds.Add(otherClient.Id);

                var response = await Client.GetAsync($"{ById(ApiScopesRoute, apiScopeId)}/{ClientsRouteSegment}");

                response.StatusCode.Should().Be(HttpStatusCode.OK);
                var clients = await response.Content.ReadFromJsonAsync<ClientsApiDto>();
                clients.Should().NotBeNull();
                clients!.TotalCount.Should().Be(2);
                clients.Clients.Should().Contain(x => x.Id == enabledClient.Id && x.Enabled);
                clients.Clients.Should().Contain(x => x.Id == disabledClient.Id && !x.Enabled);
                clients.Clients.Should().NotContain(x => x.Id == otherClient.Id);
            }
            finally
            {
                foreach (var clientId in clientIds)
                {
                    await SafeDeleteAsync(ClientsRoute, clientId);
                }

                await SafeDeleteAsync(ApiScopesRoute, apiScopeId);
            }
        }

        [Fact]
        public async Task GetApiScopeApiResourcesReturnsResourcesIncludingTheScope()
        {
            SetupAdminAuthorization();
            var apiScopeId = 0;
            var apiResourceId = 0;

            try
            {
                var apiScope = await PostAsync<ApiScopeApiDto, ApiScopeApiDto>(ApiScopesRoute,
                    ApiScopesControllerTests.BuildApiScopeCreatePayload(UniqueValue("scope_usage_api_scope")));
                apiScopeId = apiScope.Id;

                var apiResourcePayload = ApiResourcesControllerTests.BuildApiResourceCreatePayload(UniqueValue("scope_usage_api_resource"));
                apiResourcePayload.Scopes = new List<string> { apiScope.Name };
                var apiResource = await PostAsync<ApiResourceApiDto, ApiResourceApiDto>(ApiResourcesRoute, apiResourcePayload);
                apiResourceId = apiResource.Id;

                var response = await Client.GetAsync($"{ById(ApiScopesRoute, apiScopeId)}/{ApiResourcesRouteSegment}");

                response.StatusCode.Should().Be(HttpStatusCode.OK);
                var apiResources = await response.Content.ReadFromJsonAsync<ApiResourcesApiDto>();
                apiResources.Should().NotBeNull();
                apiResources!.TotalCount.Should().Be(1);
                apiResources.ApiResources.Should().ContainSingle(x => x.Id == apiResourceId);
            }
            finally
            {
                await SafeDeleteAsync(ApiResourcesRoute, apiResourceId);
                await SafeDeleteAsync(ApiScopesRoute, apiScopeId);
            }
        }

        [Fact]
        public async Task GetIdentityResourceClientsReturnsClientsAllowingTheResource()
        {
            SetupAdminAuthorization();
            var identityResourceId = 0;
            var clientId = 0;

            try
            {
                var identityResource = await PostAsync<IdentityResourceApiDto, IdentityResourceApiDto>(IdentityResourcesRoute,
                    IdentityResourcesControllerTests.BuildIdentityResourceCreatePayload(UniqueValue("scope_usage_identity_resource")));
                identityResourceId = identityResource.Id;

                var client = await CreateClientAsync(identityResource.Name);
                clientId = client.Id;

                var response = await Client.GetAsync($"{ById(IdentityResourcesRoute, identityResourceId)}/{ClientsRouteSegment}");

                response.StatusCode.Should().Be(HttpStatusCode.OK);
                var clients = await response.Content.ReadFromJsonAsync<ClientsApiDto>();
                clients.Should().NotBeNull();
                clients!.TotalCount.Should().Be(1);
                clients.Clients.Should().ContainSingle(x => x.Id == clientId);
            }
            finally
            {
                await SafeDeleteAsync(ClientsRoute, clientId);
                await SafeDeleteAsync(IdentityResourcesRoute, identityResourceId);
            }
        }

        [Fact]
        public async Task GetClientCountsByScopesReturnsCountPerScope()
        {
            SetupAdminAuthorization();
            var usedScope = UniqueValue("scope_usage_count");
            var unusedScope = UniqueValue("scope_usage_count_unused");
            var clientIds = new List<int>();

            try
            {
                clientIds.Add((await CreateClientAsync(usedScope)).Id);
                clientIds.Add((await CreateClientAsync(usedScope, enabled: false)).Id);

                var response = await Client.GetAsync(
                    $"{ClientCountsByScopesRoute}?scopes={Uri.EscapeDataString(usedScope)}&scopes={Uri.EscapeDataString(unusedScope)}");

                response.StatusCode.Should().Be(HttpStatusCode.OK);
                var counts = await response.Content.ReadFromJsonAsync<Dictionary<string, int>>();
                counts.Should().BeEquivalentTo(new Dictionary<string, int>
                {
                    [usedScope] = 2,
                    [unusedScope] = 0
                });
            }
            finally
            {
                foreach (var clientId in clientIds)
                {
                    await SafeDeleteAsync(ClientsRoute, clientId);
                }
            }
        }

        [Fact]
        public async Task GetClientCountsByScopesWithoutPermissionsReturnsUnauthorized()
        {
            ClearAuthorization();

            var response = await Client.GetAsync($"{ClientCountsByScopesRoute}?scopes=openid");

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Theory]
        [InlineData(ApiScopesRoute, ClientsRouteSegment)]
        [InlineData(ApiScopesRoute, ApiResourcesRouteSegment)]
        [InlineData(IdentityResourcesRoute, ClientsRouteSegment)]
        public async Task GetUsageOfMissingScopeReturnsBadRequest(string route, string segment)
        {
            SetupAdminAuthorization();

            var response = await Client.GetAsync($"{ById(route, MissingEntityId)}/{segment}");

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Theory]
        [InlineData(ApiScopesRoute, ClientsRouteSegment)]
        [InlineData(ApiScopesRoute, ApiResourcesRouteSegment)]
        [InlineData(IdentityResourcesRoute, ClientsRouteSegment)]
        public async Task GetUsageWithoutPermissionsReturnsUnauthorized(string route, string segment)
        {
            ClearAuthorization();

            var response = await Client.GetAsync($"{ById(route, MissingEntityId)}/{segment}");

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
