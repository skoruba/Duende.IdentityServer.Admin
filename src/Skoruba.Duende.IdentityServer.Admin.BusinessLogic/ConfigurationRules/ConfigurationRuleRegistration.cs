// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

/// <summary>
/// One rule type added to the service collection; the registry turns these into descriptors.
/// </summary>
public sealed class ConfigurationRuleRegistration
{
    public ConfigurationRuleRegistration(Type implementationType, bool isBuiltIn)
    {
        ArgumentNullException.ThrowIfNull(implementationType);

        if (!typeof(IConfigurationRule).IsAssignableFrom(implementationType) || implementationType.IsAbstract || implementationType.IsGenericTypeDefinition)
        {
            throw new ArgumentException($"{implementationType.FullName} is not a concrete {nameof(IConfigurationRule)} implementation.", nameof(implementationType));
        }

        ImplementationType = implementationType;
        IsBuiltIn = isBuiltIn;
    }

    public Type ImplementationType { get; }

    public bool IsBuiltIn { get; }
}
