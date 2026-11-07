// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientAccessTokenLifetimeTooLongRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ClientAccessTokenLifetimeTooLong;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Client Access Token Lifetime Too Long";
    public override string Description => "Detects clients with access token lifetime exceeding the recommended maximum.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Number("maxLifetimeSeconds", "Maximum Lifetime (seconds)", "Maximum allowed access token lifetime in seconds", defaultValue: 3600, minValue: 300, maxValue: 86400, required: true)
    ];

    public override string DefaultConfiguration => "{\"maxLifetimeSeconds\": 3600}";
    public override string ExampleConfiguration => "{\"maxLifetimeSeconds\": 7200}";
    public override string DefaultMessageTemplate => "Access token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s";
    public override string DefaultFixDescription => "Navigate to Client Details → Advanced tab → Token, find 'Access Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
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

    private class TokenLifetimeConfig
    {
        public int MaxLifetimeSeconds { get; set; } = 3600;
    }
}
