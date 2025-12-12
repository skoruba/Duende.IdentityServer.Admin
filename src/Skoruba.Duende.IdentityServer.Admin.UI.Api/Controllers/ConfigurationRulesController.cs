// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
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
public class ConfigurationRulesController : ControllerBase
{
    private readonly IConfigurationRulesService _configurationRulesService;
    private readonly IConfigurationRuleMetadataProvider _metadataProvider;

    public ConfigurationRulesController(
        IConfigurationRulesService configurationRulesService,
        IConfigurationRuleMetadataProvider metadataProvider)
    {
        _configurationRulesService = configurationRulesService;
        _metadataProvider = metadataProvider;
    }

    [HttpGet]
    public async Task<ActionResult<ConfigurationRulesDto>> Get()
    {
        var rules = await _configurationRulesService.GetAllRulesAsync();
        return Ok(rules);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ConfigurationRuleDto>> Get(int id)
    {
        var rule = await _configurationRulesService.GetRuleByIdAsync(id);

        if (rule == null)
        {
            return NotFound();
        }

        return Ok(rule);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ConfigurationRuleDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<ConfigurationRuleDto>> Post([FromBody] ConfigurationRuleDto rule)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        await _configurationRulesService.AddRuleAsync(rule);
        return CreatedAtAction(nameof(Get), new { id = rule.Id }, rule);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, [FromBody] ConfigurationRuleDto rule)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (id != rule.Id)
        {
            return BadRequest("ID mismatch");
        }

        var existingRule = await _configurationRulesService.GetRuleByIdAsync(id);
        if (existingRule == null)
        {
            return NotFound();
        }

        await _configurationRulesService.UpdateRuleAsync(rule);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existingRule = await _configurationRulesService.GetRuleByIdAsync(id);
        if (existingRule == null)
        {
            return NotFound();
        }

        await _configurationRulesService.DeleteRuleAsync(id);
        return NoContent();
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> ToggleRule(int id)
    {
        var rule = await _configurationRulesService.GetRuleByIdAsync(id);
        if (rule == null)
        {
            return NotFound();
        }

        rule.IsEnabled = !rule.IsEnabled;
        await _configurationRulesService.UpdateRuleAsync(rule);

        return Ok(new { isEnabled = rule.IsEnabled });
    }

    [HttpGet("metadata")]
    public ActionResult<List<ConfigurationRuleMetadataDto>> GetAllMetadata()
    {
        var metadata = _metadataProvider.GetAllMetadata();
        return Ok(metadata);
    }

    [HttpGet("metadata/{ruleType}")]
    public ActionResult<ConfigurationRuleMetadataDto> GetMetadata(ConfigurationRuleType ruleType)
    {
        var metadata = _metadataProvider.GetMetadata(ruleType);

        if (metadata == null)
        {
            return NotFound();
        }

        return Ok(metadata);
    }
}
