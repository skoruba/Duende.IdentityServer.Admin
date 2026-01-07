// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services;

public class ConfigurationRulesService : IConfigurationRulesService
{
    private readonly IConfigurationRulesRepository _repository;
    private readonly IConfigurationRuleMetadataProvider _metadataProvider;

    public ConfigurationRulesService(
        IConfigurationRulesRepository repository,
        IConfigurationRuleMetadataProvider metadataProvider)
    {
        _repository = repository;
        _metadataProvider = metadataProvider;
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
        ValidateConfiguration(ruleDto);

        var exists = await _repository.RuleTypeExistsAsync(ruleDto.RuleType);
        if (exists)
        {
            throw new InvalidOperationException($"A rule with type '{ruleDto.RuleType}' already exists.");
        }

        var rule = ruleDto.ToEntity();
        var created = await _repository.AddRuleAsync(rule);
        return created.Id;
    }

    public async Task<int> UpdateRuleAsync(ConfigurationRuleDto ruleDto)
    {
        ValidateConfiguration(ruleDto);

        var exists = await _repository.RuleTypeExistsAsync(ruleDto.RuleType, ruleDto.Id);
        if (exists)
        {
            throw new InvalidOperationException($"A rule with type '{ruleDto.RuleType}' already exists.");
        }

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

    private void ValidateConfiguration(ConfigurationRuleDto ruleDto)
    {
        if (string.IsNullOrWhiteSpace(ruleDto.Configuration))
        {
            return;
        }

        var metadata = _metadataProvider.GetMetadata(ruleDto.RuleType);
        if (metadata == null)
        {
            throw new InvalidOperationException($"No metadata found for rule type '{ruleDto.RuleType}'");
        }

        if (metadata.Parameters == null || metadata.Parameters.Count == 0)
        {
            if (!string.IsNullOrWhiteSpace(ruleDto.Configuration))
            {
                throw new InvalidOperationException(
                    $"Rule type '{ruleDto.RuleType}' does not accept configuration parameters, but configuration was provided: {ruleDto.Configuration}");
            }
            return;
        }

        JsonDocument json;
        try
        {
            json = JsonDocument.Parse(ruleDto.Configuration);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                $"Invalid JSON in Configuration field: {ex.Message}. Configuration: {ruleDto.Configuration}",
                ex);
        }

        using (json)
        {
            foreach (var param in metadata.Parameters)
            {
                var paramName = param.Name;

                if (json.RootElement.TryGetProperty(paramName, out var value))
                {
                    switch (param.Type?.ToLower())
                    {
                        case "number":
                            if (value.ValueKind != JsonValueKind.Number)
                            {
                                throw new InvalidOperationException(
                                    $"Parameter '{paramName}' must be a number, but got {value.ValueKind}. Value: {value}");
                            }

                            if (param.MinValue != null || param.MaxValue != null)
                            {
                                if (value.TryGetInt32(out var intValue))
                                {
                                    if (param.MinValue != null && intValue < Convert.ToInt32(param.MinValue))
                                    {
                                        throw new InvalidOperationException(
                                            $"Parameter '{paramName}' value {intValue} is below minimum {param.MinValue}");
                                    }
                                    if (param.MaxValue != null && intValue > Convert.ToInt32(param.MaxValue))
                                    {
                                        throw new InvalidOperationException(
                                            $"Parameter '{paramName}' value {intValue} exceeds maximum {param.MaxValue}");
                                    }
                                }
                            }
                            break;

                        case "boolean":
                            if (value.ValueKind != JsonValueKind.True && value.ValueKind != JsonValueKind.False)
                            {
                                throw new InvalidOperationException(
                                    $"Parameter '{paramName}' must be a boolean (true/false), but got {value.ValueKind}. Value: {value}");
                            }
                            break;

                        case "string":
                            if (value.ValueKind != JsonValueKind.String)
                            {
                                throw new InvalidOperationException(
                                    $"Parameter '{paramName}' must be a string, but got {value.ValueKind}. Value: {value}");
                            }
                            break;

                        case "array":
                            if (value.ValueKind != JsonValueKind.Array)
                            {
                                throw new InvalidOperationException(
                                    $"Parameter '{paramName}' must be an array, but got {value.ValueKind}. Value: {value}");
                            }

                            if (param.Required && value.GetArrayLength() == 0)
                            {
                                throw new InvalidOperationException(
                                    $"Required parameter '{paramName}' cannot be an empty array");
                            }
                            break;

                        default:
                            throw new InvalidOperationException(
                                $"Unknown parameter type '{param.Type}' for parameter '{paramName}'");
                    }
                }
                else if (param.Required)
                {
                    throw new InvalidOperationException(
                        $"Required parameter '{paramName}' is missing in configuration. Expected type: {param.Type}");
                }
            }
        }
    }
}
