// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;

public class ApiScopeMustHaveDisplayNameRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        return context.ApiScopes
            .Where(s => string.IsNullOrWhiteSpace(s.DisplayName))
            .Select(s => new ConfigurationIssueView
            {
                ResourceId = s.Id,
                ResourceName = s.Name,
                Message = messageTemplate,
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.ApiScope
            })
            .ToList();
    }
}
