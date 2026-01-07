// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;

public class ScopeIsUnusedRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<UnusedScopeConfig>(configuration);
        var excludeScopes = config.ExcludeScopes ?? new[] { "openid", "profile", "email", "address", "phone", "offline_access" };

        // Get all scopes
        var allScopes = context.ApiScopes
            .Select(s => s.Name)
            .ToList();

        // Get scopes used by clients
        var clientUsedScopes = context.Clients
            .SelectMany(c => c.AllowedScopes)
            .Select(cs => cs.Scope)
            .Distinct()
            .ToList();

        // Get scopes used by API resources
        var apiResourceUsedScopes = context.ApiResources
            .SelectMany(ar => ar.Scopes)
            .Select(ars => ars.Scope)
            .Distinct()
            .ToList();

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
            var scope = context.ApiScopes.FirstOrDefault(s => s.Name == scopeName);
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