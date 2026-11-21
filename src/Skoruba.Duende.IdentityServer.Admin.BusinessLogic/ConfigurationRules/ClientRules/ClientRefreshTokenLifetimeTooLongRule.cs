// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientRefreshTokenLifetimeTooLongRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ClientRefreshTokenLifetimeTooLong;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Client Refresh Token Lifetime Too Long";
    public override string Description => "Detects clients with refresh token lifetime exceeding the recommended maximum.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Number("maxLifetimeSeconds", "Maximum Lifetime (seconds)", "Maximum allowed refresh token lifetime in seconds", defaultValue: 2592000, minValue: 3600, maxValue: 31536000, required: true)
    ];

    public override string DefaultConfiguration => "{\"maxLifetimeSeconds\": 2592000}";
    public override string ExampleConfiguration => "{\"maxLifetimeSeconds\": 7776000}";
    public override string DefaultMessageTemplate => "Client '{clientName}' refresh token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s";
    public override string DefaultFixDescription => "Navigate to Client Details → Advanced tab → Token, find 'Refresh Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
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
                ["clientName"] = GetDisplayName(client.ClientName, client.ClientId),
                ["actualLifetime"] = client.AbsoluteRefreshTokenLifetime.ToString(),
                ["maxLifetime"] = maxLifetimeSeconds.ToString()
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

    private class LifetimeConfig
    {
        public int? MaxLifetimeSeconds { get; set; }
    }
}
