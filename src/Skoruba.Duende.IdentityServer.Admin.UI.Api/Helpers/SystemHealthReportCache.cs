// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Helpers
{
    /// <summary>
    /// The dashboard polls the health report from every open tab, and a report runs every
    /// registered check - databases and the IdentityServer discovery. The last report is
    /// therefore shared for a short while instead of being computed per request.
    /// </summary>
    public class SystemHealthReportCache(DashboardConfiguration dashboardConfiguration, TimeProvider timeProvider = null)
    {
        private readonly TimeProvider _timeProvider = timeProvider ?? TimeProvider.System;
        private readonly SemaphoreSlim _refreshLock = new(1, 1);

        private HealthReport _report;
        private DateTimeOffset _validUntil;

        public async Task<HealthReport> GetReportAsync(HealthCheckService healthCheckService, CancellationToken cancellationToken)
        {
            var cacheDuration = TimeSpan.FromSeconds(dashboardConfiguration.SystemHealthCacheSeconds);
            if (cacheDuration <= TimeSpan.Zero)
            {
                return await healthCheckService.CheckHealthAsync(cancellationToken);
            }

            var cached = Volatile.Read(ref _report);
            if (cached != null && _timeProvider.GetUtcNow() < _validUntil)
            {
                return cached;
            }

            // One caller refreshes, the others wait for its report instead of running the checks again
            await _refreshLock.WaitAsync(cancellationToken);
            try
            {
                if (_report != null && _timeProvider.GetUtcNow() < _validUntil)
                {
                    return _report;
                }

                var report = await healthCheckService.CheckHealthAsync(cancellationToken);

                _validUntil = _timeProvider.GetUtcNow().Add(cacheDuration);
                Volatile.Write(ref _report, report);

                return report;
            }
            finally
            {
                _refreshLock.Release();
            }
        }
    }
}
