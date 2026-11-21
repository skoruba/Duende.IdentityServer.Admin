// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

/// <summary>
/// A registered rule: the type to instantiate for a validation run and its metadata, copied
/// from an instance once, so that no instance - nor the services it depends on - outlives the
/// registration.
/// </summary>
public sealed class ConfigurationRuleDescriptor
{
    public ConfigurationRuleDescriptor(Type implementationType, IConfigurationRuleMetadata metadata, bool isBuiltIn)
    {
        ImplementationType = implementationType ?? throw new ArgumentNullException(nameof(implementationType));
        Metadata = new Snapshot(metadata ?? throw new ArgumentNullException(nameof(metadata)));
        IsBuiltIn = isBuiltIn;
    }

    public Type ImplementationType { get; }

    public IConfigurationRuleMetadata Metadata { get; }

    /// <summary>
    /// True for the rules shipped with this project, false for rules a deployment adds.
    /// </summary>
    public bool IsBuiltIn { get; }

    public string Key => Metadata.Key;

    private sealed class Snapshot : IConfigurationRuleMetadata
    {
        public Snapshot(IConfigurationRuleMetadata metadata)
        {
            Key = metadata.Key;
            ResourceType = metadata.ResourceType;
            DisplayName = metadata.DisplayName;
            Description = metadata.Description;
            Parameters = metadata.Parameters?.ToArray() ?? Array.Empty<ConfigurationRuleParameter>();
            DefaultConfiguration = metadata.DefaultConfiguration;
            ExampleConfiguration = metadata.ExampleConfiguration;
            DefaultMessageTemplate = metadata.DefaultMessageTemplate;
            DefaultFixDescription = metadata.DefaultFixDescription;
        }

        public string Key { get; }
        public ConfigurationResourceType ResourceType { get; }
        public string DisplayName { get; }
        public string Description { get; }
        public IReadOnlyList<ConfigurationRuleParameter> Parameters { get; }
        public string DefaultConfiguration { get; }
        public string ExampleConfiguration { get; }
        public string DefaultMessageTemplate { get; }
        public string DefaultFixDescription { get; }
    }
}
