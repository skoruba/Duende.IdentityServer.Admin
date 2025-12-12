// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services;

public class ConfigurationRulesService : IConfigurationRulesService
{
    private readonly IConfigurationRulesRepository _repository;

    public ConfigurationRulesService(IConfigurationRulesRepository repository)
    {
        _repository = repository;
    }

    public async Task<ConfigurationRulesDto> GetAllRulesAsync()
    {
        var rules = await _repository.GetAllRulesAsync();

        return new ConfigurationRulesDto
        {
            Rules = rules.Select(r => r.ToDto()).ToList(),
            TotalCount = rules.Count,
            PageSize = rules.Count
        };
    }

    public async Task<ConfigurationRuleDto> GetRuleByIdAsync(int id)
    {
        var rule = await _repository.GetRuleByIdAsync(id);
        return rule?.ToDto();
    }

    public async Task<int> AddRuleAsync(ConfigurationRuleDto ruleDto)
    {
        var rule = ruleDto.ToEntity();
        return await _repository.AddRuleAsync(rule);
    }

    public async Task<int> UpdateRuleAsync(ConfigurationRuleDto ruleDto)
    {
        var rule = ruleDto.ToEntity();
        return await _repository.UpdateRuleAsync(rule);
    }

    public async Task<int> DeleteRuleAsync(int id)
    {
        return await _repository.DeleteRuleAsync(id);
    }

    public async Task<bool> ToggleRuleAsync(int id)
    {
        var rule = await _repository.GetRuleByIdAsync(id);
        if (rule == null)
        {
            return false;
        }

        rule.IsEnabled = !rule.IsEnabled;
        await _repository.UpdateRuleAsync(rule);
        return true;
    }
}
