// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Configuration
{
    public class DashboardConfigurationTests
    {
        private static DashboardConfiguration Bind(Dictionary<string, string> values)
        {
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(values).Build();

            // The same expression the API registration uses.
            return configuration.GetSection(nameof(DashboardConfiguration)).Get<DashboardConfiguration>() ?? new DashboardConfiguration();
        }

        [Fact]
        public void MissingSection_UsesTheDefaults()
        {
            var dashboard = Bind(new Dictionary<string, string>());

            dashboard.RecentAuditChangesDefaultCount.Should().Be(8);
            dashboard.RecentAuditChangesMaxCount.Should().Be(50);
            dashboard.RecentAuditChangesScanLimit.Should().Be(5000);
            dashboard.SystemHealthCacheSeconds.Should().Be(30);
        }

        [Fact]
        public void PartialSection_OverridesOnlyWhatItSets()
        {
            var dashboard = Bind(new Dictionary<string, string>
            {
                ["DashboardConfiguration:RecentAuditChangesScanLimit"] = "20000"
            });

            dashboard.RecentAuditChangesScanLimit.Should().Be(20000);
            dashboard.RecentAuditChangesDefaultCount.Should().Be(8);
            dashboard.RecentAuditChangesMaxCount.Should().Be(50);
        }
    }
}
