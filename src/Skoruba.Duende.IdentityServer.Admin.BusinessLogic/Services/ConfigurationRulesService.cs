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
        if (_metadataProvider.GetMetadata(ruleDto.RuleType) == null)
        {
            throw new InvalidOperationException($"Rule type '{ruleDto.RuleType}' is not registered in this deployment.");
        }

        ValidateConfiguration(ruleDto.RuleType, ruleDto.Configuration);

        var exists = await _repository.RuleTypeExistsAsync(ruleDto.RuleType);
        if (exists)
        {
            throw new InvalidOperationException($"A rule with type '{ruleDto.RuleType}' already exists.");
        }

        var rule = ruleDto.ToEntity();
        var created = await _repository.AddRuleAsync(rule);
        return created.Id;
    }

    /// <summary>
    /// Updates the settings of a stored rule. Its key stays - the repository does not write it -
    /// so the configuration is checked against the stored rule, and a request with another key
    /// is refused rather than validated against a rule it does not change. A rule no registered
    /// rule describes is refused too: nothing could check its configuration, and a form without
    /// the parameters would save it without one. It can still be toggled or deleted.
    /// </summary>
    public async Task<int> UpdateRuleAsync(ConfigurationRuleDto ruleDto)
    {
        var stored = await _repository.GetRuleByIdAsync(ruleDto.Id);
        if (stored == null)
        {
            return 0;
        }

        if (!string.Equals(ruleDto.RuleType, stored.RuleType, StringComparison.Ordinal))
        {
            throw new InvalidOperationException(
                $"The type of a stored rule cannot be changed from '{stored.RuleType}' to '{ruleDto.RuleType}'. Delete the rule and create it again.");
        }

        if (_metadataProvider.GetMetadata(stored.RuleType) == null)
        {
            throw new InvalidOperationException(
                $"Rule type '{stored.RuleType}' is not registered in this deployment. Register the rule again to change its settings, or delete it.");
        }

        ValidateConfiguration(stored.RuleType, ruleDto.Configuration);

        var rule = ruleDto.ToEntity();
        return await _repository.UpdateRuleAsync(rule);
    }

    public async Task<int> DeleteRuleAsync(int id)
    {
        return await _repository.DeleteRuleAsync(id);
    }

    /// <summary>
    /// Switches a rule on or off without validating its configuration again. A rule no registered
    /// rule describes can be switched off, not on - the validation would skip it anyway.
    /// </summary>
    public async Task<bool> ToggleRuleAsync(int id)
    {
        var rule = await _repository.GetRuleByIdAsync(id);
        if (rule == null)
        {
            return false;
        }

        if (!rule.IsEnabled && _metadataProvider.GetMetadata(rule.RuleType) == null)
        {
            throw new InvalidOperationException(
                $"Rule type '{rule.RuleType}' is not registered in this deployment. Register the rule again to enable it, or delete it.");
        }

        rule.IsEnabled = !rule.IsEnabled;
        await _repository.UpdateRuleAsync(rule);
        return true;
    }

    private void ValidateConfiguration(string ruleType, string configuration)
    {
        if (string.IsNullOrWhiteSpace(configuration))
        {
            return;
        }

        var metadata = _metadataProvider.GetMetadata(ruleType);
        if (metadata == null)
        {
            throw new InvalidOperationException($"No metadata found for rule type '{ruleType}'");
        }

        if (metadata.Parameters == null || metadata.Parameters.Count == 0)
        {
            if (!string.IsNullOrWhiteSpace(configuration))
            {
                throw new InvalidOperationException(
                    $"Rule type '{ruleType}' does not accept configuration parameters, but configuration was provided: {configuration}");
            }
            return;
        }

        JsonDocument json;
        try
        {
            json = JsonDocument.Parse(configuration);
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                $"Invalid JSON in Configuration field: {ex.Message}. Configuration: {configuration}",
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

                            // A number parameter is read as an int. A fraction or a value out of its range
                            // would fail the deserialization and leave every parameter of the rule on its default
                            if (!value.TryGetInt32(out var intValue))
                            {
                                throw new InvalidOperationException(
                                    $"Parameter '{paramName}' must be a whole number, but got {value}");
                            }

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

                            // Every array parameter is a list of names - an empty entry would match everything,
                            // anything but a string would silently fall back to the rule defaults
                            if (value.EnumerateArray().Any(item => item.ValueKind != JsonValueKind.String || string.IsNullOrWhiteSpace(item.GetString())))
                            {
                                throw new InvalidOperationException(
                                    $"Parameter '{paramName}' must contain non-empty strings only. Value: {value}");
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
