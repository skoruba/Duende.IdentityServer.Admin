// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientMustHaveScopesRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ClientMustHaveScopes;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Client Must Have Scopes";
    public override string Description => "Ensures clients have at least one allowed scope configured.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Number("minScopes", "Minimum Scopes", "Minimum number of scopes required", defaultValue: 1, minValue: 0, maxValue: 100)
    ];

    public override string DefaultConfiguration => "{\"minScopes\": 1}";
    public override string ExampleConfiguration => "{\"minScopes\": 3}";
    public override string DefaultMessageTemplate => "Client '{clientName}' has {actualCount} allowed scope(s), but requires at least {requiredCount}";
    public override string DefaultFixDescription => "Navigate to Client Details → Resources tab → Allowed Scopes section and add at least one scope from the available list.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
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
                ["clientName"] = GetDisplayName(client.ClientName, client.ClientId),
                ["actualCount"] = client.AllowedScopes.Count.ToString(),
                ["requiredCount"] = minScopes.ToString()
            };

            issues.Add(new ConfigurationIssueView
            {
                ResourceId = client.Id,
                ResourceName = GetDisplayName(client.ClientName, client.ClientId),
                Message = FormatMessage(messageTemplate, parameters),
                FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
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
