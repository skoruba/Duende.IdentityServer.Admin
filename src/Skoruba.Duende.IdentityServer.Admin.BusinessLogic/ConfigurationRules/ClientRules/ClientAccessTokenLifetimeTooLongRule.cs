// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientAccessTokenLifetimeTooLongRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<TokenLifetimeConfig>(configuration);
        var maxLifetime = config.MaxLifetimeSeconds > 0 ? config.MaxLifetimeSeconds : 3600; // Default 1 hour

        var clients = context.Clients
            .Where(c => c.AccessTokenLifetime > maxLifetime)
            .ToList();

        var issues = new List<ConfigurationIssueView>();
        foreach (var client in clients)
        {
            var parameters = new Dictionary<string, string>
            {
                ["maxLifetime"] = maxLifetime.ToString(),
                ["actualLifetime"] = client.AccessTokenLifetime.ToString()
            };

            issues.Add(new ConfigurationIssueView
            {
                ResourceId = client.Id,
                ResourceName = client.ClientName,
                Message = FormatMessage(messageTemplate, parameters),
                FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.Client,
                MessageParameters = parameters
            });
        }

        return issues;
    }

    private class TokenLifetimeConfig
    {
        public int MaxLifetimeSeconds { get; set; } = 3600;
    }
}
