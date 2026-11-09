// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Logs;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.ExceptionHandling;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Mappers;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [TypeFilter(typeof(ControllerExceptionFilterAttribute))]
    [Produces("application/json")]
    [Authorize(Policy = AuthorizationConsts.AdministrationPolicy)]
    public class LogsController(IAuditLogService auditLogService, ILogService logService) : ControllerBase
    {
        [HttpGet(nameof(AuditLog))]
        public async Task<ActionResult<AuditLogsDto>> AuditLog([FromQuery]AuditLogFilterDto filters)
        {
            var logs = await auditLogService.GetAsync(filters);

            return Ok(logs);
        }

        [HttpGet(nameof(ErrorLog))]
        public async Task<ActionResult<ErrorLogsApiDto>> ErrorLog(string searchText, int page = 1, int pageSize = 10)
        {
            var logs = await logService.GetLogsAsync(searchText, page, pageSize);

            return Ok(logs.ToErrorLogsApiDto());
        }

        [HttpDelete(nameof(ErrorLog))]
        [ProducesResponseType(204)]
        public async Task<IActionResult> DeleteErrorLog([FromQuery] DateTimeOffset deleteOlderThan)
        {
            // The Admin UI sends the picked day as midnight UTC. The offset survives the binding, unlike
            // a DateTime, which is converted to the server time zone; PostgreSQL only takes a UTC one.
            await logService.DeleteLogsOlderThanAsync(deleteOlderThan.UtcDateTime.Date);

            return NoContent();
        }
    }
}
