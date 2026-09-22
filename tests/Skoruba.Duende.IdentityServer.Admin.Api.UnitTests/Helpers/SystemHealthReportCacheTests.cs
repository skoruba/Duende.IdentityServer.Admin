// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Helpers;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Helpers
{
    public class SystemHealthReportCacheTests
    {
        [Fact]
        public async Task ReportIsReusedUntilItExpires()
        {
            var clock = new ManualTimeProvider();
            var healthChecks = new CountingHealthCheckService();
            var cache = new SystemHealthReportCache(new DashboardConfiguration { SystemHealthCacheSeconds = 30 }, clock);

            var first = await cache.GetReportAsync(healthChecks, CancellationToken.None);
            clock.Advance(TimeSpan.FromSeconds(29));
            var second = await cache.GetReportAsync(healthChecks, CancellationToken.None);

            second.Should().BeSameAs(first);
            healthChecks.Runs.Should().Be(1);

            clock.Advance(TimeSpan.FromSeconds(2));
            var third = await cache.GetReportAsync(healthChecks, CancellationToken.None);

            third.Should().NotBeSameAs(first);
            healthChecks.Runs.Should().Be(2);
        }

        [Fact]
        public async Task ConcurrentCallersShareOneRun()
        {
            var healthChecks = new CountingHealthCheckService(TimeSpan.FromMilliseconds(100));
            var cache = new SystemHealthReportCache(new DashboardConfiguration());

            var reports = await Task.WhenAll(Enumerable.Range(0, 10)
                .Select(_ => cache.GetReportAsync(healthChecks, CancellationToken.None)));

            healthChecks.Runs.Should().Be(1);
            reports.Should().OnlyContain(report => ReferenceEquals(report, reports[0]));
        }

        [Fact]
        public async Task ZeroDurationTurnsTheReuseOff()
        {
            var healthChecks = new CountingHealthCheckService();
            var cache = new SystemHealthReportCache(new DashboardConfiguration { SystemHealthCacheSeconds = 0 });

            await cache.GetReportAsync(healthChecks, CancellationToken.None);
            await cache.GetReportAsync(healthChecks, CancellationToken.None);

            healthChecks.Runs.Should().Be(2);
        }

        [Fact]
        public async Task FailedRunIsNotCached()
        {
            var healthChecks = new CountingHealthCheckService { FailNextRun = true };
            var cache = new SystemHealthReportCache(new DashboardConfiguration());

            await FluentActions.Awaiting(() => cache.GetReportAsync(healthChecks, CancellationToken.None))
                .Should().ThrowAsync<InvalidOperationException>();

            var report = await cache.GetReportAsync(healthChecks, CancellationToken.None);

            report.Should().NotBeNull();
            healthChecks.Runs.Should().Be(2);
        }

        private sealed class CountingHealthCheckService(TimeSpan? delay = null) : HealthCheckService
        {
            private int _runs;

            public int Runs => _runs;

            public bool FailNextRun { get; set; }

            public override async Task<HealthReport> CheckHealthAsync(Func<HealthCheckRegistration, bool> predicate,
                CancellationToken cancellationToken = default)
            {
                Interlocked.Increment(ref _runs);

                if (delay.HasValue)
                {
                    await Task.Delay(delay.Value, cancellationToken);
                }

                if (FailNextRun)
                {
                    FailNextRun = false;
                    throw new InvalidOperationException("The health checks could not run.");
                }

                return new HealthReport(new Dictionary<string, HealthReportEntry>(), TimeSpan.Zero);
            }
        }

        private sealed class ManualTimeProvider : TimeProvider
        {
            private DateTimeOffset _now = new(2026, 9, 19, 12, 0, 0, TimeSpan.Zero);

            public override DateTimeOffset GetUtcNow() => _now;

            public void Advance(TimeSpan by) => _now = _now.Add(by);
        }
    }
}
