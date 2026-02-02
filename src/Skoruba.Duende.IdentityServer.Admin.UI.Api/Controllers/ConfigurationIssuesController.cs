// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.ExceptionHandling;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = AuthorizationConsts.AdministrationPolicy)]
[TypeFilter(typeof(ControllerExceptionFilterAttribute))]
public class ConfigurationIssuesController(IConfigurationIssuesService configurationIssuesService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ConfigurationIssuesPagedDto>> Get([FromQuery] ConfigurationIssuesFilterDto filter)
    {
        // Default to skip pagination for backward compatibility
        if (filter == null)
        {
            filter = new ConfigurationIssuesFilterDto { SkipPagination = true };
        }
        else if (filter.PageSize <= 0 && !filter.SkipPagination)
        {
            filter.SkipPagination = true;
        }

        var result = await configurationIssuesService.GetIssuesAsync(filter);
        return Ok(result);
    }

    [HttpGet(nameof(GetSummary))]
    public async Task<ActionResult<ConfigurationIssueSummaryDto>> GetSummary()
    {
        var issues = await configurationIssuesService.GetAllIssuesAsync();

        var summary = new ConfigurationIssueSummaryDto
        {
            Errors = issues.Count(i => i.IssueType == ConfigurationIssueTypeView.Error),
            Warnings = issues.Count(i => i.IssueType == ConfigurationIssueTypeView.Warning),
            Recommendations = issues.Count(i => i.IssueType == ConfigurationIssueTypeView.Recommendation)
        };

        return Ok(summary);
    }
}