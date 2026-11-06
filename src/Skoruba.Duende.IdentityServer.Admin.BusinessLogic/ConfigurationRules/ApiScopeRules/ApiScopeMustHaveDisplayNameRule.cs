// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;

public class ApiScopeMustHaveDisplayNameRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ApiScopeMustHaveDisplayName;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.ApiScope;
    public override string DisplayName => "API Scope Must Have Display Name";
    public override string Description => "Ensures all API scopes have a user-friendly display name.";
    public override string DefaultMessageTemplate => "API Scope is missing a display name";
    public override string DefaultFixDescription => "Navigate to API Scope Details → Basic Information section and add a user-friendly Display Name.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        return context.ApiScopes
            .Where(s => string.IsNullOrWhiteSpace(s.DisplayName))
            .Select(s => new ConfigurationIssueView
            {
                ResourceId = s.Id,
                ResourceName = s.Name,
                Message = messageTemplate,
                FixDescription = fixDescriptionTemplate,
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.ApiScope
            })
            .ToList();
    }
}
