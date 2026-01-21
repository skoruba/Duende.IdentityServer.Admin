// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class MissingPkceRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        return context.Clients
            .Where(c => c.AllowedGrantTypes.Any(g => g.GrantType == "authorization_code")
                && c.RequirePkce == false)
            .Select(c => new ConfigurationIssueView
            {
                ResourceId = c.Id,
                ResourceName = c.ClientName,
                Message = messageTemplate,
                FixDescription = fixDescriptionTemplate,
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.Client
            })
            .ToList();
    }
}
