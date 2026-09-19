// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Info;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class InfoControllerTests : AdminApiTestBase
    {
        private const string EnvironmentRoute = "api/info/GetEnvironment";
        private const string HealthRoute = "api/info/GetHealth";

        // The API serializes enums as strings.
        private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
        {
            Converters = { new JsonStringEnumConverter() }
        };

        public InfoControllerTests(TestFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task GetEnvironmentAsAdmin()
        {
            SetupAdminAuthorization();

            var response = await Client.GetAsync(EnvironmentRoute);

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var environment = await response.Content.ReadFromJsonAsync<EnvironmentInfoApiDto>(JsonOptions);
            environment.Should().NotBeNull();
            environment!.EnvironmentName.Should().NotBeNullOrWhiteSpace();
        }

        [Fact]
        public async Task GetEnvironmentWithoutPermissions()
        {
            ClearAuthorization();

            var response = await Client.GetAsync(EnvironmentRoute);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetHealthAsAdminAlwaysReturnsOkWithTheStatusInTheBody()
        {
            SetupAdminAuthorization();

            var response = await Client.GetAsync(HealthRoute);

            // Unlike /health (503 when unhealthy), the report is a successful response
            // whatever its status, so typed clients never treat it as a failed request.
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var health = await response.Content.ReadFromJsonAsync<SystemHealthApiDto>(JsonOptions);
            health.Should().NotBeNull();
            health!.Entries.Should().NotBeNull();

            if (health.Status == SystemHealthStatus.Unknown)
            {
                // The host registered no health checks.
                health.Entries.Should().BeEmpty();
            }
            else
            {
                health.Entries.Should().NotBeEmpty();
                health.Entries.Should().OnlyContain(entry =>
                    !string.IsNullOrWhiteSpace(entry.Name) && entry.Status != SystemHealthStatus.Unknown);
            }
        }

        [Fact]
        public async Task GetHealthWithoutPermissions()
        {
            ClearAuthorization();

            var response = await Client.GetAsync(HealthRoute);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
