// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Text.Json;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

public abstract class ConfigurationRuleValidatorBase
{
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
        catch
        {
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
}
