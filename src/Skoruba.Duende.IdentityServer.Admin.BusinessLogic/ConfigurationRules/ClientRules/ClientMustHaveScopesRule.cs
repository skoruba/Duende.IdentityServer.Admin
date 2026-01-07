// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientMustHaveScopesRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ScopesConfig>(configuration);
        var minScopes = config.MinScopes ?? 1;

        var clients = context.Clients
            .Where(c => c.AllowedScopes.Count < minScopes)
            .ToList();

        var issues = new List<ConfigurationIssueView>();

        foreach (var client in clients)
        {
            var parameters = new Dictionary<string, string>
            {
                ["clientName"] = client.ClientName ?? client.ClientId,
                ["actualCount"] = client.AllowedScopes.Count.ToString(),
                ["requiredCount"] = minScopes.ToString()
            };

            issues.Add(new ConfigurationIssueView
            {
                ResourceId = client.Id,
                ResourceName = client.ClientName ?? client.ClientId,
                Message = FormatMessage(messageTemplate, parameters),
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.Client,
                MessageParameters = parameters
            });
        }

        return issues;
    }

    private class ScopesConfig
    {
        public int? MinScopes { get; set; }
    }
}
