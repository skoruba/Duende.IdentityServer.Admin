// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;

public class SecretIsExpiredInDaysRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
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
            var isExpired = daysUntilExpiry < 0;

            var parameters = new Dictionary<string, string>
            {
                ["clientName"] = client.ClientName ?? client.ClientId,
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
                ResourceName = client.ClientName ?? client.ClientId,
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
