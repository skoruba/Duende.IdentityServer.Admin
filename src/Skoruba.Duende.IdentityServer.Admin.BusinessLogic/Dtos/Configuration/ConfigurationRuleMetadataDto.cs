// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

/// <summary>
/// Metadata about a configuration rule type including its configuration schema
/// </summary>
public class ConfigurationRuleMetadataDto
{
    public string RuleType { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string ResourceType { get; set; }
    public List<ConfigurationRuleParameterDto> Parameters { get; set; }
    public string DefaultConfiguration { get; set; }
    public string ExampleConfiguration { get; set; }
    public string DefaultMessageTemplate { get; set; }
    public string DefaultFixDescription { get; set; }
}

/// <summary>
/// Definition of a single configuration parameter
/// </summary>
public class ConfigurationRuleParameterDto
{
    public string Name { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string Type { get; set; } // "string", "number", "boolean", "array"
    public bool Required { get; set; }
    public object DefaultValue { get; set; }
    public object MinValue { get; set; }
    public object MaxValue { get; set; }
    public string Pattern { get; set; } // Pro regex validaci
    public List<string> AllowedValues { get; set; } // Pro enum-like values
}
