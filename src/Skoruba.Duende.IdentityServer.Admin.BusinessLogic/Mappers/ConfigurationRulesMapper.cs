// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;

public static class ConfigurationRulesMapper
{
    public static ConfigurationRuleDto ToDto(this ConfigurationRule rule)
    {
        return new ConfigurationRuleDto
        {
            Id = rule.Id,
            RuleType = rule.RuleType,
            ResourceType = rule.ResourceType,
            IssueType = rule.IssueType,
            IsEnabled = rule.IsEnabled,
            Configuration = rule.Configuration,
            MessageTemplate = rule.MessageTemplate,
            FixDescription = rule.FixDescription,
            CreatedAt = rule.CreatedAt,
            UpdatedAt = rule.UpdatedAt
        };
    }

    public static ConfigurationRule ToEntity(this ConfigurationRuleDto dto)
    {
        return new ConfigurationRule
        {
            Id = dto.Id,
            RuleType = dto.RuleType,
            ResourceType = dto.ResourceType,
            IssueType = dto.IssueType,
            IsEnabled = dto.IsEnabled,
            Configuration = dto.Configuration,
            MessageTemplate = dto.MessageTemplate,
            FixDescription = dto.FixDescription,
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt
        };
    }
}
