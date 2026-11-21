// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

/// <summary>
/// What a configuration rule says about itself: its key and what the Admin UI shows for it.
/// </summary>
public interface IConfigurationRuleMetadata
{
    /// <summary>
    /// Stable identifier the stored rule refers to; see <see cref="ConfigurationRuleKeys"/>.
    /// </summary>
    string Key { get; }

    ConfigurationResourceType ResourceType { get; }

    string DisplayName { get; }

    string Description { get; }

    /// <summary>
    /// Values the rule reads from its JSON configuration. Empty when the rule takes none.
    /// </summary>
    IReadOnlyList<ConfigurationRuleParameter> Parameters { get; }

    /// <summary>
    /// JSON the Admin UI pre-fills when the rule is created, or null.
    /// </summary>
    string DefaultConfiguration { get; }

    /// <summary>
    /// JSON shown as an example of a non-default configuration, or null.
    /// </summary>
    string ExampleConfiguration { get; }

    string DefaultMessageTemplate { get; }

    string DefaultFixDescription { get; }
}
