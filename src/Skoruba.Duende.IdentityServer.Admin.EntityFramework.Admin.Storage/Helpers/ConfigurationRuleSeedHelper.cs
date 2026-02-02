// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Helpers;

public static class ConfigurationRuleSeedHelper
{
    private static readonly Dictionary<ConfigurationRuleType, (string MessageTemplate, string FixDescription, string Configuration)> _defaultRuleData = new()
    {
        [ConfigurationRuleType.ObsoleteImplicitGrant] = (
            "Client uses obsolete implicit grant flow",
            "Navigate to Client Details → Advanced tab → Grant Types, remove 'implicit' and add 'authorization_code' instead.",
            null
        ),

        [ConfigurationRuleType.ObsoletePasswordGrant] = (
            "Client uses obsolete password grant flow",
            "Navigate to Client Details → Advanced tab → Grant Types, remove 'password' and add 'authorization_code' or 'client_credentials' instead.",
            null
        ),

        [ConfigurationRuleType.MissingPkce] = (
            "Client uses authorization code flow without PKCE",
            "Navigate to Client Details → Advanced tab → Authentication, scroll down and enable 'Require Proof Key for Code Exchange (PKCE)' toggle.",
            null
        ),

        [ConfigurationRuleType.ClientRedirectUrisMustUseHttps] = (
            "Client has {count} non-HTTPS redirect URI(s): {uris}",
            "Navigate to Client Details → URLs tab → Redirect URIs section and update all HTTP URIs to use HTTPS protocol.",
            "{\"allowLocalhost\": true}"
        ),

        [ConfigurationRuleType.ClientMustHaveScopes] = (
            "Client '{clientName}' has {actualCount} allowed scope(s), but requires at least {requiredCount}",
            "Navigate to Client Details → Resources tab → Allowed Scopes section and add at least one scope from the available list.",
            "{\"minScopes\": 1}"
        ),

        [ConfigurationRuleType.ClientAccessTokenLifetimeTooLong] = (
            "Access token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s",
            "Navigate to Client Details → Advanced tab → Token, find 'Access Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.",
            "{\"maxLifetimeSeconds\": 3600}"
        ),

        [ConfigurationRuleType.ClientRefreshTokenLifetimeTooLong] = (
            "Client '{clientName}' refresh token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s",
            "Navigate to Client Details → Advanced tab → Token, find 'Refresh Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.",
            "{\"maxLifetimeSeconds\": 2592000}"
        ),

        [ConfigurationRuleType.ApiScopeNameMustStartWith] = (
            "API Scope '{actualName}' must start with one of: {allowedPrefixes}",
            "Navigate to API Scope Details → Basic Information section and rename the scope to start with one of the required prefixes: {allowedPrefixes}.",
            "{\"prefixes\": [\"scope_\"]}"
        ),

        [ConfigurationRuleType.ApiScopeNameMustNotContain] = (
            "API Scope '{scopeName}' contains forbidden string(s): {forbiddenStrings}",
            "Navigate to API Scope Details → Basic Information section and rename the scope to remove forbidden strings from the name.",
            "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}"
        ),

        [ConfigurationRuleType.ApiScopeMustHaveDisplayName] = (
            "API Scope is missing a display name",
            "Navigate to API Scope Details → Basic Information section and add a user-friendly Display Name.",
            null
        ),

        [ConfigurationRuleType.ApiResourceMustHaveScopes] = (
            "API Resource '{resourceName}' has {actualCount} scope(s), but requires at least {requiredCount}",
            "Navigate to API Resource Details → Scopes section and add at least one scope to this API Resource.",
            "{\"minScopes\": 1}"
        ),

        [ConfigurationRuleType.ApiResourceNameMustStartWith] = (
            "API Resource '{actualName}' must start with one of: {allowedPrefixes}",
            "Navigate to API Resource Details → Basic Information section and rename the resource to follow the naming convention.",
            "{\"prefixes\": [\"api.\"]}"
        ),

        [ConfigurationRuleType.IdentityResourceMustBeEnabled] = (
            "Required identity resource '{resourceName}' ({displayName}) is disabled",
            "Navigate to Identity Resource Details → Basic Information section and enable the 'Enabled' toggle.",
            "{\"requiredResources\": [\"openid\", \"profile\"]}"
        ),

        [ConfigurationRuleType.IdentityResourceNameMustStartWith] = (
            "Identity Resource '{actualName}' must start with one of: {allowedPrefixes}",
            "Navigate to Identity Resource Details → Basic Information section and rename the resource to follow the naming convention.",
            "{\"prefixes\": [\"custom.\"], \"excludeStandard\": true}"
        ),

        [ConfigurationRuleType.ScopeIsUnused] = (
            "API Scope '{scopeName}'{displayNameSuffix} is not used by any clients or API resources",
            "This API Scope '{scopeName}' is not used by any clients or API resources. Consider removing it from API Scopes list or assigning it to relevant clients/resources.",
            "{\"excludeScopes\": [\"openid\", \"profile\", \"email\", \"address\", \"phone\", \"offline_access\"]}"
        ),

        [ConfigurationRuleType.SecretIsExpiredInDays] = (
            "Client '{clientName}' has a secret ({secretType}) that {status} in {daysUntilExpiry} day(s) on {expirationDate}",
            "Navigate to Client Details → Advanced tab → Authentication → Secrets section, remove the expired secret and add a new one with proper expiration date.",
            "{\"warningDays\": 30, \"includeAlreadyExpired\": true}"
        )
    };

    public static (string MessageTemplate, string FixDescription, string Configuration) GetDefaultRuleData(ConfigurationRuleType ruleType)
    {
        return _defaultRuleData.TryGetValue(ruleType, out var data)
            ? data
            : (null, null, null);
    }

    public static ConfigurationRule[] GetSeedData()
    {
        var baseDate = new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
        var seedData = new List<ConfigurationRule>();

        // Default enabled rules (critical security issues)
        var enabledRules = new[]
        {
            (ConfigurationRuleType.ObsoleteImplicitGrant, ConfigurationResourceType.Client, ConfigurationIssueType.Error),
            (ConfigurationRuleType.ObsoletePasswordGrant, ConfigurationResourceType.Client, ConfigurationIssueType.Error),
            (ConfigurationRuleType.MissingPkce, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleType.ClientMustHaveScopes, ConfigurationResourceType.Client, ConfigurationIssueType.Error),
            (ConfigurationRuleType.ApiResourceMustHaveScopes, ConfigurationResourceType.ApiResource, ConfigurationIssueType.Error)
        };

        // Default disabled rules (optional/configurable)
        var disabledRules = new[]
        {
            (ConfigurationRuleType.ClientRedirectUrisMustUseHttps, ConfigurationResourceType.Client, ConfigurationIssueType.Error),
            (ConfigurationRuleType.ClientAccessTokenLifetimeTooLong, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleType.ClientRefreshTokenLifetimeTooLong, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleType.ApiScopeNameMustStartWith, ConfigurationResourceType.ApiScope, ConfigurationIssueType.Warning),
            (ConfigurationRuleType.ApiScopeNameMustNotContain, ConfigurationResourceType.ApiScope, ConfigurationIssueType.Warning),
            (ConfigurationRuleType.ApiScopeMustHaveDisplayName, ConfigurationResourceType.ApiScope, ConfigurationIssueType.Recommendation),
            (ConfigurationRuleType.ApiResourceNameMustStartWith, ConfigurationResourceType.ApiResource, ConfigurationIssueType.Warning),
            (ConfigurationRuleType.IdentityResourceMustBeEnabled, ConfigurationResourceType.IdentityResource, ConfigurationIssueType.Warning),
            (ConfigurationRuleType.IdentityResourceNameMustStartWith, ConfigurationResourceType.IdentityResource, ConfigurationIssueType.Warning),
            (ConfigurationRuleType.ScopeIsUnused, ConfigurationResourceType.ApiScope, ConfigurationIssueType.Recommendation),
            (ConfigurationRuleType.SecretIsExpiredInDays, ConfigurationResourceType.Client, ConfigurationIssueType.Warning)
        };

        int id = 1;

        // Add enabled rules
        foreach (var (ruleType, resourceType, issueType) in enabledRules)
        {
            var (messageTemplate, fixDescription, configuration) = GetDefaultRuleData(ruleType);
            seedData.Add(new ConfigurationRule
            {
                Id = id++,
                RuleType = ruleType,
                ResourceType = resourceType,
                IssueType = issueType,
                IsEnabled = true,
                Configuration = configuration,
                MessageTemplate = messageTemplate,
                FixDescription = fixDescription,
                CreatedAt = baseDate,
                UpdatedAt = null
            });
        }

        // Add disabled rules
        foreach (var (ruleType, resourceType, issueType) in disabledRules)
        {
            var (messageTemplate, fixDescription, configuration) = GetDefaultRuleData(ruleType);
            seedData.Add(new ConfigurationRule
            {
                Id = id++,
                RuleType = ruleType,
                ResourceType = resourceType,
                IssueType = issueType,
                IsEnabled = false,
                Configuration = configuration,
                MessageTemplate = messageTemplate,
                FixDescription = fixDescription,
                CreatedAt = baseDate,
                UpdatedAt = null
            });
        }

        return seedData.ToArray();
    }
}