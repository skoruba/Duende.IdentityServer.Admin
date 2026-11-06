// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class MissingPkceRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.MissingPkce;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Missing PKCE";
    public override string Description => "Detects clients using authorization code flow without PKCE (Proof Key for Code Exchange).";
    public override string DefaultMessageTemplate => "Client uses authorization code flow without PKCE";
    public override string DefaultFixDescription => "Navigate to Client Details → Advanced tab → Authentication, scroll down and enable 'Require Proof Key for Code Exchange (PKCE)' toggle.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        return context.Clients
            .Where(c => c.AllowedGrantTypes.Any(g => g.GrantType == "authorization_code")
                && c.RequirePkce == false)
            .Select(c => new ConfigurationIssueView
            {
                ResourceId = c.Id,
                ResourceName = GetDisplayName(c.ClientName, c.ClientId),
                Message = messageTemplate,
                FixDescription = fixDescriptionTemplate,
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.Client
            })
            .ToList();
    }
}
