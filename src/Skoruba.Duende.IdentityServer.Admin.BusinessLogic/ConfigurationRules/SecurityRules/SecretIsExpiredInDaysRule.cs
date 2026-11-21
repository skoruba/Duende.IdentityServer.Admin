// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;

public class SecretIsExpiredInDaysRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.SecretIsExpiredInDays;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Secret Is Expired In Days";
    public override string Description => "Detects client secrets that are expired or will expire within a specified number of days, helping prevent authentication failures.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Number("warningDays", "Warning Days", "Number of days before expiration to start warning", defaultValue: 30, minValue: 1, maxValue: 365),
        ConfigurationRuleParameter.Boolean("includeAlreadyExpired", "Include Already Expired", "Include secrets that are already expired", defaultValue: true)
    ];

    public override string DefaultConfiguration => "{\"warningDays\": 30, \"includeAlreadyExpired\": true}";
    public override string ExampleConfiguration => "{\"warningDays\": 14, \"includeAlreadyExpired\": false}";
    public override string DefaultMessageTemplate => "Client '{clientName}' has a secret ({secretType}) that {status} in {daysUntilExpiry} day(s) on {expirationDate}";
    public override string DefaultFixDescription => "Navigate to Client Details → Advanced tab → Authentication → Secrets section, remove the expired secret and add a new one with proper expiration date.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ExpirationConfig>(configuration);
        var warningDays = config.WarningDays ?? 30;
        var includeAlreadyExpired = config.IncludeAlreadyExpired ?? true;

        var warningDate = DateTime.UtcNow.AddDays(warningDays);
        var now = DateTime.UtcNow;

        // Get client secrets that expire within the warning period or are already expired
        var expiringSecrets = context.Clients
            .SelectMany(c => c.ClientSecrets.Select(cs => new { Secret = cs, Client = c }))
            .Where(x => x.Secret.Expiration.HasValue &&
                        (includeAlreadyExpired ? x.Secret.Expiration.Value <= warningDate :
                         x.Secret.Expiration.Value > now && x.Secret.Expiration.Value <= warningDate))
            .OrderBy(x => x.Secret.Expiration)
            .ToList();

        var issues = new List<ConfigurationIssueView>();

        foreach (var item in expiringSecrets)
        {
            var secret = item.Secret;
            var client = item.Client;
            var daysUntilExpiry = (int)(secret.Expiration.Value - now).TotalDays;
            var isExpired = secret.Expiration.Value <= now;

            var parameters = new Dictionary<string, string>
            {
                ["clientName"] = GetDisplayName(client.ClientName, client.ClientId),
                ["clientId"] = client.ClientId,
                ["secretType"] = secret.Type ?? "SharedSecret",
                ["secretDescription"] = secret.Description ?? "No description",
                ["expirationDate"] = secret.Expiration.Value.ToString("yyyy-MM-dd HH:mm"),
                ["daysUntilExpiry"] = Math.Abs(daysUntilExpiry).ToString(),
                ["isExpired"] = isExpired.ToString(),
                ["status"] = isExpired ? "EXPIRED" : "EXPIRING"
            };

            issues.Add(new ConfigurationIssueView
            {
                ResourceId = client.Id,
                ResourceName = GetDisplayName(client.ClientName, client.ClientId),
                Message = FormatMessage(messageTemplate, parameters),
                FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
                IssueType = isExpired ? ConfigurationIssueTypeView.Error : issueType,
                ResourceType = ConfigurationResourceType.Client,
                MessageParameters = parameters
            });
        }

        return issues;
    }

    private class ExpirationConfig
    {
        public int? WarningDays { get; set; }
        public bool? IncludeAlreadyExpired { get; set; }
    }
}
