// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Constants;
using Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Tests.Base;
using Xunit;

namespace Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Tests
{
    /// <summary>
    /// The test host has no database behind the database checks, which is the outage a liveness
    /// probe must not react to.
    /// </summary>
    public class HealthEndpointsTests : BaseClassFixture
    {
        public HealthEndpointsTests(TestFixture fixture) : base(fixture)
        {
        }

        private async Task<JsonElement> GetEntriesAsync(string path)
        {
            var response = await Client.GetAsync(path);
            using var report = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

            return report.RootElement.GetProperty("entries").Clone();
        }

        [Fact]
        public async Task LiveIsHealthyWithoutRunningTheDependencyChecks()
        {
            var response = await Client.GetAsync(HealthCheckEndpoints.Live);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            (await response.Content.ReadAsStringAsync()).Should().Be("Healthy");
        }

        [Fact]
        public async Task ReadyRunsEveryCheckIncludingTheSigningKeys()
        {
            var ready = await GetEntriesAsync(HealthCheckEndpoints.Ready);
            var all = await GetEntriesAsync(HealthCheckEndpoints.Health);

            ready.EnumerateObject().Select(x => x.Name).Should()
                .BeEquivalentTo(all.EnumerateObject().Select(x => x.Name));
            ready.GetProperty("SigningKeys").GetProperty("status").GetString().Should().Be("Healthy");
        }
    }
}
