// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Info;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.ExceptionHandling;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [TypeFilter(typeof(ControllerExceptionFilterAttribute))]
    [Produces("application/json")]
    [Authorize(Policy = AuthorizationConsts.AdministrationPolicy)]
    public class InfoController(AdminApiConfiguration adminApiConfiguration, IWebHostEnvironment webHostEnvironment) : ControllerBase
    {

        [HttpGet(nameof(GetApplicationVersion))]
        public ActionResult<string> GetApplicationVersion()
        {
            return typeof(StartupHelpers).GetInformationalVersion();
        }

        [HttpGet(nameof(GetApplicationName))]
        public ActionResult<string> GetApplicationName()
        {
            if (adminApiConfiguration == null)
            {
                return NotFound();
            }

            return adminApiConfiguration.ApplicationName;
        }

        /// <summary>
        /// Health of the Admin API dependencies (databases, IdentityServer discovery).
        /// Always answers 200 and carries the status in the body - unlike the /health
        /// endpoint, which answers 503 - so typed clients can read an unhealthy report
        /// instead of handling it as a failed request.
        /// </summary>
        [HttpGet(nameof(GetHealth))]
        public async Task<ActionResult<SystemHealthApiDto>> GetHealth(CancellationToken cancellationToken)
        {
            // Health checks are registered by the host (AddIdSHealthChecks), not by this library,
            // so a host without them must not break the controller.
            var healthCheckService = HttpContext.RequestServices.GetService<HealthCheckService>();
            if (healthCheckService == null)
            {
                return new SystemHealthApiDto();
            }

            // The cache is registered with the Admin API services - a host without it still gets a fresh report
            var reportCache = HttpContext.RequestServices.GetService<SystemHealthReportCache>();
            var report = reportCache != null
                ? await reportCache.GetReportAsync(healthCheckService, cancellationToken)
                : await healthCheckService.CheckHealthAsync(cancellationToken);

            return new SystemHealthApiDto
            {
                Status = MapStatus(report.Status),
                IdentityServerStatus = report.Entries.TryGetValue(ConfigurationConsts.IdentityServerHealthCheckName, out var identityServer)
                    ? MapStatus(identityServer.Status)
                    : SystemHealthStatus.Unknown,
                Entries = report.Entries
                    .Select(entry => new SystemHealthEntryApiDto
                    {
                        Name = entry.Key,
                        Status = MapStatus(entry.Value.Status)
                    })
                    .ToList()
            };
        }

        private static SystemHealthStatus MapStatus(HealthStatus status)
        {
            return status switch
            {
                HealthStatus.Healthy => SystemHealthStatus.Healthy,
                HealthStatus.Degraded => SystemHealthStatus.Degraded,
                HealthStatus.Unhealthy => SystemHealthStatus.Unhealthy,
                _ => SystemHealthStatus.Unknown
            };
        }

        [HttpGet(nameof(GetEnvironment))]
        public ActionResult<EnvironmentInfoApiDto> GetEnvironment()
        {
            return new EnvironmentInfoApiDto
            {
                EnvironmentName = webHostEnvironment.EnvironmentName,
                IdentityServerBaseUrl = adminApiConfiguration?.IdentityServerBaseUrl
            };
        }
    }
}