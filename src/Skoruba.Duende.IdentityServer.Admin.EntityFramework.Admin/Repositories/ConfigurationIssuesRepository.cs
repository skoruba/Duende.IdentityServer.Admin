// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories;

public class ConfigurationIssuesRepository<TDbContext>(
    TDbContext dbContext,
    IConfigurationRulesDbContext rulesDbContext,
    IConfigurationRuleValidatorFactory ruleValidatorFactory) : IConfigurationIssuesRepository
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    public async Task<List<ConfigurationIssueView>> GetAllIssuesAsync()
    {
        var issues = new List<ConfigurationIssueView>();

        // Get all enabled rules from database
        var enabledRules = await rulesDbContext.ConfigurationRules
            .Where(r => r.IsEnabled)
            .ToListAsync();

        // Execute each rule
        foreach (var rule in enabledRules)
        {
            try
            {
                var validator = ruleValidatorFactory.Create(rule.RuleType);
                var issueTypeView = (ConfigurationIssueTypeView)rule.IssueType;
                var ruleIssues = await validator.ValidateAsync(rule.Configuration, rule.MessageTemplate, issueTypeView);

                // Add FixDescription from rule to each issue
                foreach (var issue in ruleIssues)
                {
                    issue.FixDescription = rule.FixDescription;
                }

                issues.AddRange(ruleIssues);
            }
            catch
            {
                // Log error if needed, but continue with other rules
            }
        }

        return issues;
    }
}