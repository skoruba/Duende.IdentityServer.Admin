// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log;
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
    public class LogsController(IAuditLogService auditLogService) : ControllerBase
    {
        [HttpGet(nameof(AuditLog))]
        public async Task<ActionResult<AuditLogsDto>> AuditLog([FromQuery]AuditLogFilterDto filters)
        {
            var logs = await auditLogService.GetAsync(filters);

            return Ok(logs);
        }
    }
}