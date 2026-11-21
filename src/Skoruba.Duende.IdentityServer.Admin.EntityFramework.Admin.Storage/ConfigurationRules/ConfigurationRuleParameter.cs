// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

/// <summary>
/// One value of a rule's JSON configuration: what the Admin UI asks for and what the
/// Admin API checks before a rule is stored. <see cref="Name"/> is the JSON property name.
/// </summary>
public class ConfigurationRuleParameter
{
    public string Name { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public ConfigurationRuleParameterType Type { get; set; }
    public bool Required { get; set; }

    /// <summary>
    /// Value used when the stored configuration leaves the parameter out. For an
    /// <see cref="ConfigurationRuleParameterType.Array"/> parameter this is a string array.
    /// </summary>
    public object DefaultValue { get; set; }

    public object MinValue { get; set; }
    public object MaxValue { get; set; }
    public string Pattern { get; set; }
    public List<string> AllowedValues { get; set; }

    public static ConfigurationRuleParameter String(string name, string displayName, string description,
        string defaultValue = null, bool required = false, string pattern = null, IEnumerable<string> allowedValues = null)
    {
        return new ConfigurationRuleParameter
        {
            Name = name,
            DisplayName = displayName,
            Description = description,
            Type = ConfigurationRuleParameterType.String,
            Required = required,
            DefaultValue = defaultValue,
            Pattern = pattern,
            AllowedValues = allowedValues == null ? null : new List<string>(allowedValues)
        };
    }

    public static ConfigurationRuleParameter Number(string name, string displayName, string description,
        int? defaultValue = null, int? minValue = null, int? maxValue = null, bool required = false)
    {
        return new ConfigurationRuleParameter
        {
            Name = name,
            DisplayName = displayName,
            Description = description,
            Type = ConfigurationRuleParameterType.Number,
            Required = required,
            DefaultValue = defaultValue,
            MinValue = minValue,
            MaxValue = maxValue
        };
    }

    public static ConfigurationRuleParameter Boolean(string name, string displayName, string description,
        bool? defaultValue = null, bool required = false)
    {
        return new ConfigurationRuleParameter
        {
            Name = name,
            DisplayName = displayName,
            Description = description,
            Type = ConfigurationRuleParameterType.Boolean,
            Required = required,
            DefaultValue = defaultValue
        };
    }

    public static ConfigurationRuleParameter Array(string name, string displayName, string description,
        string[] defaultValue = null, bool required = false)
    {
        return new ConfigurationRuleParameter
        {
            Name = name,
            DisplayName = displayName,
            Description = description,
            Type = ConfigurationRuleParameterType.Array,
            Required = required,
            DefaultValue = defaultValue
        };
    }
}
