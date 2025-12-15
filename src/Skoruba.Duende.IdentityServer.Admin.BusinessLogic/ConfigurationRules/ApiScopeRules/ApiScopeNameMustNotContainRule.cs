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

public class ApiScopeNameMustNotContainRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ApiScopeNameMustNotContainRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ForbiddenConfig>(configuration);

        if (config.ForbiddenStrings == null || !config.ForbiddenStrings.Any())
        {
            return new List<ConfigurationIssueView>();
        }

        var scopes = await _dbContext.ApiScopes.ToListAsync();
        var issues = new List<ConfigurationIssueView>();

        foreach (var scope in scopes)
        {
            var foundForbiddenStrings = config.ForbiddenStrings
                .Where(forbidden => scope.Name.Contains(forbidden, System.StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (foundForbiddenStrings.Any())
            {
                var parameters = new Dictionary<string, string>
                {
                    ["scopeName"] = scope.Name,
                    ["forbiddenStrings"] = string.Join(", ", foundForbiddenStrings),
                    ["allForbiddenStrings"] = string.Join(", ", config.ForbiddenStrings)
                };

                issues.Add(new ConfigurationIssueView
                {
                    ResourceId = scope.Id,
                    ResourceName = scope.Name,
                    Message = FormatMessage(messageTemplate, parameters),
                    IssueType = issueType,
                    ResourceType = ConfigurationResourceType.ApiScope,
                    MessageParameters = parameters
                });
            }
        }

        return issues;
    }

    private class ForbiddenConfig
    {
        public List<string> ForbiddenStrings { get; set; }
    }
}