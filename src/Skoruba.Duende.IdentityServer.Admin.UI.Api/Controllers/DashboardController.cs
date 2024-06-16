// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Dashboard;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
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
        
        [HttpGet(nameof(GetDashboardIdentity))]
        public async Task<ActionResult<DashboardDto>> GetDashboardIdentity()
        {
            var dashboardIdentity = await _dashboardIdentityService.GetIdentityDashboardAsync();

            return Ok(dashboardIdentity);
        }
    }
}