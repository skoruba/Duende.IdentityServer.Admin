// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

/// <summary>
/// Every rule the Admin API knows, built-in and custom, looked up by key.
/// </summary>
public interface IConfigurationRuleRegistry
{
    IReadOnlyList<ConfigurationRuleDescriptor> Rules { get; }

    /// <summary>
    /// The rule registered under the key, or null when there is none - a stored rule
    /// whose implementation was removed from the deployment.
    /// </summary>
    ConfigurationRuleDescriptor Find(string key);
}
