// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

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
}
