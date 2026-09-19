// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

public abstract class ConfigurationRuleValidatorBase
{
    protected ILogger Logger { get; set; }

    protected ConfigurationRuleValidatorBase()
    {
    }

    protected ConfigurationRuleValidatorBase(ILogger logger)
    {
        Logger = logger;
    }

    protected T DeserializeConfiguration<T>(string configuration) where T : new()
    {
        if (string.IsNullOrWhiteSpace(configuration))
        {
            return new T();
        }

        try
        {
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            return JsonSerializer.Deserialize<T>(configuration, options) ?? new T();
        }
        catch (Exception ex)
        {
            Logger?.LogWarning(ex,
                "Failed to deserialize configuration JSON: {Configuration}. Using default values.",
                configuration);
            return new T();
        }
    }

    /// <summary>
    /// Formats a message template with named parameters
    /// Example: FormatMessage("Token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s",
    ///                        new() { ["actualLifetime"] = "3600", ["maxLifetime"] = "300" })
    /// Returns: "Token lifetime 3600s exceeds maximum 300s"
    /// </summary>
    protected string FormatMessage(string template, Dictionary<string, string> parameters)
    {
        if (parameters == null || parameters.Count == 0)
        {
            return template;
        }

        var result = template;
        foreach (var param in parameters)
        {
            result = result.Replace($"{{{param.Key}}}", param.Value);
        }
        return result;
    }

    /// <summary>
    /// Values of an array parameter that can take part in a comparison. An empty entry would match
    /// every name and a null one would throw, so neither is allowed to reach the rule.
    /// </summary>
    protected static List<string> GetConfiguredValues(IEnumerable<string> values)
    {
        return values?.Where(value => !string.IsNullOrWhiteSpace(value)).ToList() ?? new List<string>();
    }

    protected static string GetDisplayName(string displayName, string name)
    {
        return string.IsNullOrWhiteSpace(displayName) ? name : displayName;
    }
}
