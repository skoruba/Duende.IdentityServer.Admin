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

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;

public class ScopeIsUnusedRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ScopeIsUnusedRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<UnusedScopeConfig>(configuration);
        var excludeScopes = config.ExcludeScopes ?? new[] { "openid", "profile", "email", "address", "phone", "offline_access" };

        // Get all scopes
        var allScopes = await _dbContext.ApiScopes
            .Select(s => s.Name)
            .ToListAsync();

        // Get scopes used by clients
        var clientUsedScopes = await _dbContext.ClientScopes
            .Select(cs => cs.Scope)
            .Distinct()
            .ToListAsync();

        // Get scopes used by API resources
        var apiResourceUsedScopes = await _dbContext.ApiResourceScopes
            .Select(ars => ars.Scope)
            .Distinct()
            .ToListAsync();

        // Combine all used scopes
        var usedScopes = clientUsedScopes.Union(apiResourceUsedScopes).ToHashSet();

        // Find unused scopes (excluding standard OIDC scopes)
        var unusedScopes = allScopes
            .Where(scope => !usedScopes.Contains(scope) &&
                           !excludeScopes.Contains(scope.ToLowerInvariant()))
            .ToList();

        var issues = new List<ConfigurationIssueView>();

        foreach (var scopeName in unusedScopes)
        {
            var scope = await _dbContext.ApiScopes.FirstOrDefaultAsync(s => s.Name == scopeName);
            if (scope != null)
            {
                var displayName = scope.DisplayName ?? scope.Name;
                var displayNameSuffix = !string.IsNullOrWhiteSpace(scope.DisplayName) &&
                                      scope.DisplayName != scope.Name ?
                                      $" ({scope.DisplayName})" : "";

                var parameters = new Dictionary<string, string>
                {
                    ["scopeName"] = scope.Name,
                    ["displayName"] = displayName,
                    ["displayNameSuffix"] = displayNameSuffix,
                    ["description"] = scope.Description ?? "No description"
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

    private class UnusedScopeConfig
    {
        public string[] ExcludeScopes { get; set; }
    }
}