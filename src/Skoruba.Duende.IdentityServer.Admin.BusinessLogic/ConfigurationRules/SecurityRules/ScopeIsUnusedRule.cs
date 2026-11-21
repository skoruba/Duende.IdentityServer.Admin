// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;

public class ScopeIsUnusedRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ScopeIsUnused;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.ApiScope;
    public override string DisplayName => "Scope Is Unused";
    public override string Description => "Detects API scopes that are not used by any clients or API resources, which may indicate unnecessary scopes that can be removed.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("excludeScopes", "Exclude Scopes", "List of scope names to exclude from unused scope detection (e.g., standard OIDC scopes)", defaultValue: new[] { "openid", "profile", "email", "address", "phone", "offline_access" })
    ];

    public override string DefaultConfiguration => "{\"excludeScopes\": [\"openid\", \"profile\", \"email\", \"address\", \"phone\", \"offline_access\"]}";
    public override string ExampleConfiguration => "{\"excludeScopes\": [\"openid\", \"profile\", \"admin\", \"system\"]}";
    public override string DefaultMessageTemplate => "API Scope '{scopeName}'{displayNameSuffix} is not used by any clients or API resources";
    public override string DefaultFixDescription => "This API Scope '{scopeName}' is not used by any clients or API resources. Consider removing it from API Scopes list or assigning it to relevant clients/resources.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
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
                           !excludeScopes.Contains(scope, StringComparer.OrdinalIgnoreCase))
            .ToList();

        var issues = new List<ConfigurationIssueView>();

        foreach (var scopeName in unusedScopes)
        {
            var scope = context.ApiScopes.FirstOrDefault(s => s.Name == scopeName);
            if (scope != null)
            {
                var displayName = GetDisplayName(scope.DisplayName, scope.Name);
                var displayNameSuffix = displayName != scope.Name
                    ? $" ({displayName})"
                    : "";

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
                    FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
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
