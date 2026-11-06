// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;

public static class ConfigurationRuleMetadataMapper
{
    public static ConfigurationRuleMetadataDto ToMetadataDto(this IConfigurationRuleMetadata rule)
    {
        return new ConfigurationRuleMetadataDto
        {
            RuleType = rule.Key,
            DisplayName = rule.DisplayName,
            Description = rule.Description,
            ResourceType = rule.ResourceType.ToString(),
            Parameters = (rule.Parameters ?? []).Select(ToDto).ToList(),
            DefaultConfiguration = rule.DefaultConfiguration,
            ExampleConfiguration = rule.ExampleConfiguration,
            DefaultMessageTemplate = rule.DefaultMessageTemplate,
            DefaultFixDescription = rule.DefaultFixDescription
        };
    }

    public static ConfigurationRuleParameterDto ToDto(this ConfigurationRuleParameter parameter)
    {
        return new ConfigurationRuleParameterDto
        {
            Name = parameter.Name,
            DisplayName = parameter.DisplayName,
            Description = parameter.Description,
            // The Admin UI and the configuration validation switch on the lower-case name.
            Type = parameter.Type.ToString().ToLowerInvariant(),
            Required = parameter.Required,
            DefaultValue = parameter.DefaultValue,
            MinValue = parameter.MinValue,
            MaxValue = parameter.MaxValue,
            Pattern = parameter.Pattern,
            AllowedValues = parameter.AllowedValues?.ToList()
        };
    }
}
