// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ObsoletePasswordGrantRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ObsoletePasswordGrant;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Obsolete Password Grant";
    public override string Description => "Detects clients using the obsolete resource owner password credentials grant flow.";
    public override string DefaultMessageTemplate => "Client uses obsolete password grant flow";
    public override string DefaultFixDescription => "Navigate to Client Details → Advanced tab → Grant Types, remove 'password' and add 'authorization_code' or 'client_credentials' instead.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        return context.Clients
            .Where(c => c.AllowedGrantTypes.Any(g => g.GrantType == "password"))
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
