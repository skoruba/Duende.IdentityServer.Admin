// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class DashboardControllerTests : AdminApiTestBase
    {
        private const string RecentAuditChangesRoute = "api/dashboard/GetRecentAuditChanges";
        private const string ReadEventSuffix = "RequestedEvent";

        public DashboardControllerTests(TestFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task GetRecentAuditChangesReportsAChangeAndLeavesReadsOut()
        {
            SetupAdminAuthorization();

            // A real change, surrounded by reads: both requests below are audited as well.
            var role = RoleCreateFaker.Generate();
            (await Client.PostAsJsonAsync(RolesRoute, role)).EnsureSuccessStatusCode();
            (await Client.GetAsync(RolesRoute)).EnsureSuccessStatusCode();

            var response = await Client.GetAsync(RecentAuditChangesRoute);

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var changes = await response.Content.ReadFromJsonAsync<List<AuditLogDto>>();
            changes.Should().NotBeNullOrEmpty();
            changes!.Count.Should().BeLessThanOrEqualTo(8);
            changes.Should().OnlyContain(x => !x.Event.EndsWith(ReadEventSuffix));
            changes.Should().BeInDescendingOrder(x => x.Id);
            changes.Should().Contain(x => x.Data.Contains(role.Name));
        }

        [Fact]
        public async Task GetRecentAuditChangesClampsAnExcessiveCount()
        {
            SetupAdminAuthorization();

            var response = await Client.GetAsync($"{RecentAuditChangesRoute}?count=100000");

            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var changes = await response.Content.ReadFromJsonAsync<List<AuditLogDto>>();
            changes!.Count.Should().BeLessThanOrEqualTo(50);
        }

        [Fact]
        public async Task GetRecentAuditChangesWithoutPermissions()
        {
            ClearAuthorization();

            var response = await Client.GetAsync(RecentAuditChangesRoute);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
