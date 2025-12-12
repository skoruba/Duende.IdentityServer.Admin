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

        return await _dbContext.Clients
            .Where(c => c.AccessTokenLifetime > maxLifetime)
            .Select(c => new ConfigurationIssueView
            {
                ResourceId = c.Id,
                ResourceName = c.ClientName,
                Message = messageTemplate,
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.Client
            })
            .ToListAsync();
    }

    private class TokenLifetimeConfig
    {
        public int MaxLifetimeSeconds { get; set; } = 3600;
    }
}
