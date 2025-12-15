// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;

public class SecretIsExpiredInDaysRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public SecretIsExpiredInDaysRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ExpirationConfig>(configuration);
        var warningDays = config.WarningDays ?? 30;
        var includeAlreadyExpired = config.IncludeAlreadyExpired ?? true;

        var warningDate = DateTime.UtcNow.AddDays(warningDays);
        var now = DateTime.UtcNow;

        // Get client secrets that expire within the warning period or are already expired
        var expiringSecrets = await _dbContext.ClientSecrets
            .Include(cs => cs.Client)
            .Where(cs => cs.Expiration.HasValue &&
                        (includeAlreadyExpired ? cs.Expiration.Value <= warningDate :
                         cs.Expiration.Value > now && cs.Expiration.Value <= warningDate))
            .OrderBy(cs => cs.Expiration)
            .ToListAsync();

        var issues = new List<ConfigurationIssueView>();

        foreach (var secret in expiringSecrets)
        {
            var daysUntilExpiry = (int)(secret.Expiration.Value - now).TotalDays;
            var isExpired = daysUntilExpiry < 0;

            var parameters = new Dictionary<string, string>
            {
                ["clientName"] = secret.Client.ClientName ?? secret.Client.ClientId,
                ["clientId"] = secret.Client.ClientId,
                ["secretType"] = secret.Type ?? "SharedSecret",
                ["secretDescription"] = secret.Description ?? "No description",
                ["expirationDate"] = secret.Expiration.Value.ToString("yyyy-MM-dd HH:mm"),
                ["daysUntilExpiry"] = Math.Abs(daysUntilExpiry).ToString(),
                ["isExpired"] = isExpired.ToString(),
                ["status"] = isExpired ? "EXPIRED" : "EXPIRING"
            };

            issues.Add(new ConfigurationIssueView
            {
                ResourceId = secret.Client.Id,
                ResourceName = secret.Client.ClientName ?? secret.Client.ClientId,
                Message = FormatMessage(messageTemplate, parameters),
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