// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories;

public class ConfigurationRulesRepository(IAdminConfigurationStoreDbContext dbContext) : IConfigurationRulesRepository
{
    private readonly IAdminConfigurationStoreDbContext _dbContext = dbContext;

    public async Task<List<ConfigurationRule>> GetAllRulesAsync()
    {
        return await _dbContext.ConfigurationRules
            .OrderBy(r => r.ResourceType)
            .ThenBy(r => r.RuleType)
            .ToListAsync();
    }

    public async Task<ConfigurationRule> GetRuleByIdAsync(int id)
    {
        return await _dbContext.ConfigurationRules
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<int> AddRuleAsync(ConfigurationRule rule)
    {
        rule.CreatedAt = DateTime.UtcNow;
        await _dbContext.ConfigurationRules.AddAsync(rule);
        return await _dbContext.SaveChangesAsync();
    }

    public async Task<int> UpdateRuleAsync(ConfigurationRule rule)
    {
        rule.UpdatedAt = DateTime.UtcNow;

        var existingRule = await _dbContext.ConfigurationRules.FindAsync(rule.Id);
        if (existingRule != null)
        {
            existingRule.IsEnabled = rule.IsEnabled;
            existingRule.IssueType = rule.IssueType;
            existingRule.MessageTemplate = rule.MessageTemplate;
            existingRule.FixDescription = rule.FixDescription;
            existingRule.Configuration = rule.Configuration;
            existingRule.UpdatedAt = rule.UpdatedAt;
        }

        return await _dbContext.SaveChangesAsync();
    }

    public async Task<int> DeleteRuleAsync(int id)
    {
        var rule = await _dbContext.ConfigurationRules.FindAsync(id);
        if (rule != null)
        {
            _dbContext.ConfigurationRules.Remove(rule);
            return await _dbContext.SaveChangesAsync();
        }
        return 0;
    }

    public async Task<bool> RuleExistsAsync(int id)
    {
        return await _dbContext.ConfigurationRules.AnyAsync(r => r.Id == id);
    }

    public async Task<bool> RuleTypeExistsAsync(ConfigurationRuleType ruleType, int? excludeId = null)
    {
        var query = _dbContext.ConfigurationRules.Where(r => r.RuleType == ruleType);

        if (excludeId.HasValue)
        {
            query = query.Where(r => r.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }
}
