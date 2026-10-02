// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Dashboard;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.DashboardIdentity;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.ExceptionHandling;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [TypeFilter(typeof(ControllerExceptionFilterAttribute))]
    [Produces("application/json")]
    [Authorize(Policy = AuthorizationConsts.AdministrationPolicy)]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IDashboardIdentityService _dashboardIdentityService;

        public DashboardController(IDashboardService dashboardService, IDashboardIdentityService dashboardIdentityService)
        {
            _dashboardService = dashboardService;
            _dashboardIdentityService = dashboardIdentityService;
        }

        /// <summary>
        /// The counters of the configuration database. With <paramref name="auditLogsLastNumberOfDays"/>
        /// above zero the response carries the audit log statistics of those days as well, which is
        /// kept for existing callers: a slow audit log then delays the counters. The Admin UI asks
        /// for 0 and loads the statistics through <see cref="GetDashboardAuditLogStatistics"/>.
        /// </summary>
        [HttpGet(nameof(GetDashboardIdentityServer))]
        public async Task<ActionResult<DashboardDto>> GetDashboardIdentityServer(int auditLogsLastNumberOfDays = 7, CancellationToken cancellationToken = default)
        {
            var days = ClampAuditLogStatisticsDays(auditLogsLastNumberOfDays);
            var dashboardIdentityServer = await _dashboardService.GetDashboardIdentityServerAsync(days, cancellationToken);

            return Ok(dashboardIdentityServer);
        }

        /// <summary>
        /// The audit log entries per day over the last <paramref name="lastNumberOfDays"/> days and their
        /// daily average. Separate from the counters on purpose: the audit log is the largest table and
        /// may live in another database, so its statistics can be slow or fail without taking the
        /// counters down with them. The maximum window comes from <see cref="DashboardConfiguration"/>.
        /// </summary>
        [HttpGet(nameof(GetDashboardAuditLogStatistics))]
        public async Task<ActionResult<DashboardAuditLogStatisticsDto>> GetDashboardAuditLogStatistics(int lastNumberOfDays = 30, CancellationToken cancellationToken = default)
        {
            var days = ClampAuditLogStatisticsDays(lastNumberOfDays);
            var statistics = await _dashboardService.GetDashboardAuditLogStatisticsAsync(days, cancellationToken);

            return Ok(statistics);
        }
        
        /// <summary>
        /// The newest audit entries that record a change (reads are left out), newest first.
        /// The defaults and limits come from <see cref="DashboardConfiguration"/>.
        /// </summary>
        [HttpGet(nameof(GetRecentAuditChanges))]
        public async Task<ActionResult<List<AuditLogDto>>> GetRecentAuditChanges(int? count = null, CancellationToken cancellationToken = default)
        {
            // Optional on purpose: a host that does not register the configuration gets the defaults.
            var configuration = HttpContext.RequestServices.GetService<DashboardConfiguration>() ?? new DashboardConfiguration();

            var maxCount = Math.Max(1, configuration.RecentAuditChangesMaxCount);
            var resolvedCount = Math.Clamp(count ?? configuration.RecentAuditChangesDefaultCount, 1, maxCount);
            var scanLimit = configuration.RecentAuditChangesScanLimit;

            // Deliberately not cached: the query is bounded and cheap, and a cached answer would
            // hide a change from the administrator who has just made it.
            return Ok(await _dashboardService.GetRecentAuditChangesAsync(resolvedCount, scanLimit, cancellationToken));
        }

        [HttpGet(nameof(GetDashboardIdentity))]
        public async Task<ActionResult<DashboardIdentityDto>> GetDashboardIdentity()
        {
            var dashboardIdentity = await _dashboardIdentityService.GetIdentityDashboardAsync();

            return Ok(dashboardIdentity);
        }

        /// <summary>
        /// Zero or less means no statistics; the upper bound keeps one request from grouping the
        /// whole audit log. Negative values are mapped to 0 so they do not turn into a full scan.
        /// </summary>
        private int ClampAuditLogStatisticsDays(int requestedDays)
        {
            // Optional on purpose: a host that does not register the configuration gets the defaults.
            var configuration = HttpContext.RequestServices.GetService<DashboardConfiguration>() ?? new DashboardConfiguration();
            var maxDays = Math.Max(1, configuration.AuditLogStatisticsMaxDays);

            return Math.Clamp(requestedDays, 0, maxDays);
        }
    }
}