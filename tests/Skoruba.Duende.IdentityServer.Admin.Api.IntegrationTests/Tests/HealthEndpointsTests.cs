// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Constants;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    /// <summary>
    /// The test host reaches neither the databases nor IdentityServer behind its checks, which is
    /// the outage a liveness probe must not react to.
    /// </summary>
    public class HealthEndpointsTests : AdminApiTestBase
    {
        public HealthEndpointsTests(TestFixture fixture) : base(fixture)
        {
        }

        private async Task<string[]> GetEntryNamesAsync(string path)
        {
            var response = await Client.GetAsync(path);
            using var report = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

            return report.RootElement.GetProperty("entries").EnumerateObject().Select(x => x.Name).ToArray();
        }

        [Fact]
        public async Task LiveIsHealthyWithoutRunningTheDependencyChecks()
        {
            ClearAuthorization();

            var response = await Client.GetAsync(HealthCheckEndpoints.Live);

            response.StatusCode.Should().Be(HttpStatusCode.OK);
            (await response.Content.ReadAsStringAsync()).Should().Be("Healthy");
        }

        [Fact]
        public async Task ReadyRunsEveryCheck()
        {
            ClearAuthorization();

            var ready = await GetEntryNamesAsync(HealthCheckEndpoints.Ready);

            ready.Should().NotBeEmpty().And.BeEquivalentTo(await GetEntryNamesAsync(HealthCheckEndpoints.Health));
        }
    }
}
