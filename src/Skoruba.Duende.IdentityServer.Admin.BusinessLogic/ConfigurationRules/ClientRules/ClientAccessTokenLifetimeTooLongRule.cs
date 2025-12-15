// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientAccessTokenLifetimeTooLongRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ClientAccessTokenLifetimeTooLongRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<TokenLifetimeConfig>(configuration);
        var maxLifetime = config.MaxLifetimeSeconds > 0 ? config.MaxLifetimeSeconds : 3600; // Default 1 hour

        var clients = await _dbContext.Clients
            .Where(c => c.AccessTokenLifetime > maxLifetime)
            .ToListAsync();

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
