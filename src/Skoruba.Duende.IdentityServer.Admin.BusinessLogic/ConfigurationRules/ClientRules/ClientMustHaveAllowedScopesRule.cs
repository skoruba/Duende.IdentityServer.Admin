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

public class ClientMustHaveAllowedScopesRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ClientMustHaveAllowedScopesRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ScopesConfig>(configuration);
        var minScopes = config.MinScopes ?? 1;

        var clients = await _dbContext.Clients
            .Include(c => c.AllowedScopes)
            .Where(c => c.AllowedScopes.Count < minScopes)
            .ToListAsync();

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