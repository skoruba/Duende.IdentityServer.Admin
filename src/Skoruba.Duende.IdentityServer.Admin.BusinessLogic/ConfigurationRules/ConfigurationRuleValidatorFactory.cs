// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

/// <summary>
/// Creates a rule instance for one validation run. The instance comes from the service
/// provider, so a rule may take constructor dependencies.
/// </summary>
public class ConfigurationRuleValidatorFactory : IConfigurationRuleValidatorFactory
{
    private readonly IConfigurationRuleRegistry _registry;
    private readonly IServiceProvider _serviceProvider;

    public ConfigurationRuleValidatorFactory(IConfigurationRuleRegistry registry, IServiceProvider serviceProvider)
    {
        _registry = registry;
        _serviceProvider = serviceProvider;
    }

    public IConfigurationRuleValidator Create(string ruleType)
    {
        var descriptor = _registry.Find(ruleType)
            ?? throw new NotSupportedException($"Configuration rule '{ruleType}' is not registered in this deployment. Register it with services.AddConfigurationRule<TRule>() or delete the stored rule.");

        return (IConfigurationRuleValidator)ActivatorUtilities.CreateInstance(_serviceProvider, descriptor.ImplementationType);
    }
}
