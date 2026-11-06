// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

/// <summary>
/// Base of every configuration rule: the metadata the Admin UI shows and the check over
/// the pre-loaded <see cref="ValidationContext"/>. Derive from
/// <see cref="ConfigurationRuleBase{TConfiguration}"/> to get the configuration deserialized
/// and the issues formatted; derive from this class to do both by hand.
/// A rule must not query the database itself - everything it needs is in the context.
/// </summary>
public abstract class ConfigurationRuleBase : ConfigurationRuleValidatorBase, IConfigurationRule
{
    public abstract string Key { get; }

    public abstract ConfigurationResourceType ResourceType { get; }

    public abstract string DisplayName { get; }

    public abstract string Description { get; }

    public virtual IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } = Array.Empty<ConfigurationRuleParameter>();

    public virtual string DefaultConfiguration => null;

    public virtual string ExampleConfiguration => null;

    public abstract string DefaultMessageTemplate { get; }

    public abstract string DefaultFixDescription { get; }

    public abstract List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration,
        string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType);
}
