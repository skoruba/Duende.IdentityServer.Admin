// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

public interface IConfigurationRuleValidatorFactory
{
    /// <summary>
    /// A fresh validator for one validation run of the rule stored under the key.
    /// Throws <see cref="System.NotSupportedException"/> when no rule is registered under it.
    /// </summary>
    IConfigurationRuleValidator Create(string ruleType);
}
