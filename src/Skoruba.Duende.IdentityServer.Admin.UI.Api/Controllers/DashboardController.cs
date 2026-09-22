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

        [HttpGet(nameof(GetDashboardIdentityServer))]
        public async Task<ActionResult<DashboardDto>> GetDashboardIdentityServer(int auditLogsLastNumberOfDays = 7)
        {
            var dashboardIdentityServer = await _dashboardService.GetDashboardIdentityServerAsync(auditLogsLastNumberOfDays);

            return Ok(dashboardIdentityServer);
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
    }
}