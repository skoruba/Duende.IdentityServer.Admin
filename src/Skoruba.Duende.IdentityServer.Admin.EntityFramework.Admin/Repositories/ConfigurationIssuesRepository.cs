// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Dtos;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Mappers;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories;

public class ConfigurationIssuesRepository<TDbContext, TRulesDbContext> : IConfigurationIssuesRepository
    where TDbContext : DbContext, IAdminConfigurationDbContext
    where TRulesDbContext : DbContext, IAdminConfigurationStoreDbContext
{
    private readonly TDbContext _dbContext;
    private readonly TRulesDbContext _rulesDbContext;
    private readonly IConfigurationRuleValidatorFactory _ruleValidatorFactory;
    private readonly ILogger<ConfigurationIssuesRepository<TDbContext, TRulesDbContext>> _logger;

    public ConfigurationIssuesRepository(
        TDbContext dbContext,
        TRulesDbContext rulesDbContext,
        IConfigurationRuleValidatorFactory ruleValidatorFactory,
        ILogger<ConfigurationIssuesRepository<TDbContext, TRulesDbContext>> logger)
    {
        _dbContext = dbContext;
        _rulesDbContext = rulesDbContext;
        _ruleValidatorFactory = ruleValidatorFactory;
        _logger = logger;
    }

    public async Task<List<ConfigurationIssueView>> GetAllIssuesAsync()
    {
        var issues = new List<ConfigurationIssueView>();

        try
        {
            var enabledRules = await _rulesDbContext.ConfigurationRules
                .Where(r => r.IsEnabled)
                .AsNoTracking()
                .ToListAsync();

            _logger.LogInformation("Executing {RuleCount} enabled configuration rules", enabledRules.Count);

            var validationContext = await LoadValidationContextAsync();

            foreach (var rule in enabledRules)
            {
                try
                {
                    var validator = _ruleValidatorFactory.Create(rule.RuleType);
                    var issueTypeView = MapIssueType(rule.IssueType);

                    var ruleIssues = validator.ValidateWithContext(
                        validationContext,
                        rule.Configuration,
                        rule.MessageTemplate,
                        rule.FixDescription,
                        issueTypeView);

                    if (ruleIssues.Count > 0)
                    {
                        _logger.LogDebug("Rule {RuleType} found {IssueCount} issues",
                            rule.RuleType, ruleIssues.Count);
                    }

                    issues.AddRange(ruleIssues);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed to execute configuration rule {RuleType} (ID: {RuleId}). Skipping this rule and continuing with others.",
                        rule.RuleType, rule.Id);
                }
            }

            _logger.LogInformation("Configuration validation completed. Found {TotalIssues} issues across all rules",
                issues.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Critical error during configuration validation");
            throw;
        }

        return issues;
    }

    private async Task<ValidationContext> LoadValidationContextAsync()
    {
        var context = new ValidationContext();

        try
        {
            context.Clients = await _dbContext.Clients
                .Include(c => c.AllowedGrantTypes)
                .Include(c => c.AllowedScopes)
                .Include(c => c.RedirectUris)
                .Include(c => c.PostLogoutRedirectUris)
                .Include(c => c.ClientSecrets)
                .AsNoTracking()
                .ToListAsync();

            context.ApiScopes = await _dbContext.ApiScopes
                .AsNoTracking()
                .ToListAsync();

            context.ApiResources = await _dbContext.ApiResources
                .Include(r => r.Scopes)
                .AsNoTracking()
                .ToListAsync();

            context.IdentityResources = await _dbContext.IdentityResources
                .AsNoTracking()
                .ToListAsync();

            _logger.LogDebug(
                "Loaded validation context: {ClientCount} clients, {ApiScopeCount} API scopes, {ApiResourceCount} API resources, {IdentityResourceCount} identity resources",
                context.Clients.Count, context.ApiScopes.Count, context.ApiResources.Count, context.IdentityResources.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load validation context");
            throw;
        }

        return context;
    }

    private ConfigurationIssueTypeView MapIssueType(ConfigurationIssueType type)
    {
        return type switch
        {
            ConfigurationIssueType.Warning => ConfigurationIssueTypeView.Warning,
            ConfigurationIssueType.Recommendation => ConfigurationIssueTypeView.Recommendation,
            ConfigurationIssueType.Error => ConfigurationIssueTypeView.Error,
            _ => throw new ArgumentException($"Unknown issue type: {type}", nameof(type))
        };
    }

    public async Task<ConfigurationIssuesPagedDto> GetIssuesAsync(ConfigurationIssuesFilterDto filter)
    {
        var allIssues = await GetAllIssuesAsync();

        var filteredQuery = allIssues.AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var searchTerm = filter.SearchTerm.ToLowerInvariant();
            filteredQuery = filteredQuery.Where(i =>
                (i.ResourceName != null && i.ResourceName.ToLowerInvariant().Contains(searchTerm)) ||
                (i.Message != null && i.Message.ToLowerInvariant().Contains(searchTerm)));
        }

        if (filter.ResourceType.HasValue)
        {
            filteredQuery = filteredQuery.Where(i => i.ResourceType == filter.ResourceType.Value);
        }

        if (filter.IssueType.HasValue)
        {
            filteredQuery = filteredQuery.Where(i => i.IssueType == filter.IssueType.Value);
        }

        var totalCount = filteredQuery.Count();
        var totalPages = filter.SkipPagination ? 1 : (int)Math.Ceiling((double)totalCount / filter.PageSize);

        if (!filter.SkipPagination)
        {
            filteredQuery = filteredQuery
                .Skip(filter.PageIndex * filter.PageSize)
                .Take(filter.PageSize);
        }

        var issuesList = filteredQuery.ToList();

        return new ConfigurationIssuesPagedDto
        {
            Issues = issuesList.Select(x => x.ToDto()).ToList(),
            TotalCount = totalCount,
            PageIndex = filter.PageIndex,
            PageSize = filter.SkipPagination ? totalCount : filter.PageSize,
            TotalPages = totalPages,
            HasNextPage = !filter.SkipPagination && filter.PageIndex < totalPages - 1,
            HasPreviousPage = !filter.SkipPagination && filter.PageIndex > 0
        };
    }
}
