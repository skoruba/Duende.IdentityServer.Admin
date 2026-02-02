// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientRefreshTokenLifetimeTooLongRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<LifetimeConfig>(configuration);
        var maxLifetimeSeconds = config.MaxLifetimeSeconds ?? 2592000; // 30 days default

        var clients = context.Clients
            .Where(c => c.AbsoluteRefreshTokenLifetime > maxLifetimeSeconds)
            .ToList();

        var issues = new List<ConfigurationIssueView>();

        foreach (var client in clients)
        {
            var parameters = new Dictionary<string, string>
            {
                ["clientName"] = client.ClientName ?? client.ClientId,
                ["actualLifetime"] = client.AbsoluteRefreshTokenLifetime.ToString(),
                ["maxLifetime"] = maxLifetimeSeconds.ToString()
            };

            issues.Add(new ConfigurationIssueView
            {
                ResourceId = client.Id,
                ResourceName = client.ClientName ?? client.ClientId,
                Message = FormatMessage(messageTemplate, parameters),
                FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.Client,
                MessageParameters = parameters
            });
        }

        return issues;
    }

    private class LifetimeConfig
    {
        public int? MaxLifetimeSeconds { get; set; }
    }
}
