// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;

public class ConfigurationIssuesRepository<TDbContext>(TDbContext dbContext) : IConfigurationIssuesRepository
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    public async Task<List<ConfigurationIssueView>> GetClientIssuesAsync()
    {
        var issues = new List<ConfigurationIssueView>();

        // Implicit grant
        var clientsWithImplicit = await dbContext.Clients
            .Where(c => c.AllowedGrantTypes.Any(g => g.GrantType == "implicit"))
            .Select(c => new ConfigurationIssueView
            {
                ResourceId = c.Id,
                ResourceName = c.ClientName,
                Message =  ConfigurationIssueMessageEnum.ObsoleteImplicitGrant,
                IssueType = ConfigurationIssueTypeView.Warning
            })
            .ToListAsync();

        issues.AddRange(clientsWithImplicit);

        // Password grant
        var clientsWithPassword = await dbContext.Clients
            .Where(c => c.AllowedGrantTypes.Any(g => g.GrantType == "password"))
            .Select(c => new ConfigurationIssueView()
            {
                ResourceId = c.Id,
                ResourceName = c.ClientName,
                Message = ConfigurationIssueMessageEnum.ObsoletePasswordGrant,
                IssueType = ConfigurationIssueTypeView.Warning,
            })
            .ToListAsync();

        issues.AddRange(clientsWithPassword);

        // Code flow without PKCE
        var clientsWithoutPkce = await dbContext.Clients
            .Where(c => c.AllowedGrantTypes.Any(g => g.GrantType == "authorization_code")
                && c.RequirePkce == false)
            .Select(c => new ConfigurationIssueView()
            {
                ResourceId = c.Id,
                ResourceName = c.ClientName,
                Message = ConfigurationIssueMessageEnum.MissingPkce,
                IssueType = ConfigurationIssueTypeView.Recommendation
            })
            .ToListAsync();

        issues.AddRange(clientsWithoutPkce);

        return issues;
    }

    public Task<List<ConfigurationIssueView>> GetApiResourceIssuesAsync()
    {
        return Task.FromResult<List<ConfigurationIssueView>>([]);
    }

    public Task<List<ConfigurationIssueView>> GetIdentityResourceIssuesAsync()
    {
        return Task.FromResult<List<ConfigurationIssueView>>([]);
    }

    public Task<List<ConfigurationIssueView>> GetApiScopeIssuesAsync()
    {
        return Task.FromResult<List<ConfigurationIssueView>>([]);
    }
}