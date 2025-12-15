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

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;

public class ApiResourceMustHaveScopesRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ApiResourceMustHaveScopesRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ScopesConfig>(configuration);
        var minScopes = config.MinScopes ?? 1;

        var apiResources = await _dbContext.ApiResources
            .Include(ar => ar.Scopes)
            .Where(ar => ar.Scopes.Count < minScopes)
            .ToListAsync();

        var issues = new List<ConfigurationIssueView>();

        foreach (var apiResource in apiResources)
        {
            var parameters = new Dictionary<string, string>
            {
                ["resourceName"] = apiResource.Name,
                ["actualCount"] = apiResource.Scopes.Count.ToString(),
                ["requiredCount"] = minScopes.ToString()
            };

            issues.Add(new ConfigurationIssueView
            {
                ResourceId = apiResource.Id,
                ResourceName = apiResource.Name,
                Message = FormatMessage(messageTemplate, parameters),
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.ApiResource,
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