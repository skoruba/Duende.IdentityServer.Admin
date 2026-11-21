// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

/// <summary>
/// Provides metadata and schema information for configuration rules
/// </summary>
public interface IConfigurationRuleMetadataProvider
{
    /// <summary>
    /// Metadata of the rule registered under the key, or null when there is none.
    /// </summary>
    ConfigurationRuleMetadataDto GetMetadata(string ruleType);

    List<ConfigurationRuleMetadataDto> GetAllMetadata();
}

/// <summary>
/// The metadata every registered rule describes itself with, built-in and custom alike.
/// </summary>
public class ConfigurationRuleMetadataProvider : IConfigurationRuleMetadataProvider
{
    private readonly IConfigurationRuleRegistry _registry;

    public ConfigurationRuleMetadataProvider(IConfigurationRuleRegistry registry)
    {
        _registry = registry;
    }

    public ConfigurationRuleMetadataDto GetMetadata(string ruleType)
    {
        return _registry.Find(ruleType)?.Metadata.ToMetadataDto();
    }

    public List<ConfigurationRuleMetadataDto> GetAllMetadata()
    {
        return _registry.Rules.Select(descriptor => descriptor.Metadata.ToMetadataDto()).ToList();
    }
}
