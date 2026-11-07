// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ObsoleteImplicitGrantRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ObsoleteImplicitGrant;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Obsolete Implicit Grant";
    public override string Description => "Detects clients using the obsolete implicit grant flow which is no longer recommended for security reasons.";
    public override string DefaultMessageTemplate => "Client uses obsolete implicit grant flow";
    public override string DefaultFixDescription => "Navigate to Client Details → Advanced tab → Grant Types, remove 'implicit' and add 'authorization_code' instead.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        return context.Clients
            .Where(c => c.AllowedGrantTypes.Any(g => g.GrantType == "implicit"))
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
