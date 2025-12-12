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

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;

public class ApiScopeNameMustStartWithRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ApiScopeNameMustStartWithRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<PrefixConfig>(configuration);

        if (string.IsNullOrWhiteSpace(config.Prefix))
        {
            return new List<ConfigurationIssueView>();
        }

        return await _dbContext.ApiScopes
            .Where(s => !s.Name.StartsWith(config.Prefix))
            .Select(s => new ConfigurationIssueView
            {
                ResourceId = s.Id,
                ResourceName = s.Name,
                Message = messageTemplate,
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.ApiScope
            })
            .ToListAsync();
    }

    private class PrefixConfig
    {
        public string Prefix { get; set; }
    }
}
