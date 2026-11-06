// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Helpers;

public static class ConfigurationRuleSeedHelper
{
    /// <summary>
    /// Rows seeded through <c>HasData</c>. The migrations refer to them by Id, so the order of
    /// the rules below is frozen: a new built-in rule is appended, a custom rule is never seeded
    /// here - it is created from the Admin UI or by <c>SeedConfiguration:ApplyConfigurationRulesSeed</c>.
    /// </summary>
    private static readonly Dictionary<string, (string MessageTemplate, string FixDescription, string Configuration)> _defaultRuleData = new(StringComparer.Ordinal)
    {
        [ConfigurationRuleKeys.ObsoleteImplicitGrant] = (
            "Client uses obsolete implicit grant flow",
            "Navigate to Client Details → Advanced tab → Grant Types, remove 'implicit' and add 'authorization_code' instead.",
            null
        ),

        [ConfigurationRuleKeys.ObsoletePasswordGrant] = (
            "Client uses obsolete password grant flow",
            "Navigate to Client Details → Advanced tab → Grant Types, remove 'password' and add 'authorization_code' or 'client_credentials' instead.",
            null
        ),

        [ConfigurationRuleKeys.MissingPkce] = (
            "Client uses authorization code flow without PKCE",
            "Navigate to Client Details → Advanced tab → Authentication, scroll down and enable 'Require Proof Key for Code Exchange (PKCE)' toggle.",
            null
        ),

        [ConfigurationRuleKeys.ClientRedirectUrisMustUseHttps] = (
            "Client has {count} non-HTTPS redirect URI(s): {uris}",
            "Navigate to Client Details → URLs tab → Redirect URIs section and update all HTTP URIs to use HTTPS protocol.",
            "{\"allowLocalhost\": true}"
        ),

        [ConfigurationRuleKeys.ClientMustHaveScopes] = (
            "Client '{clientName}' has {actualCount} allowed scope(s), but requires at least {requiredCount}",
            "Navigate to Client Details → Resources tab → Allowed Scopes section and add at least one scope from the available list.",
            "{\"minScopes\": 1}"
        ),

        [ConfigurationRuleKeys.ClientAccessTokenLifetimeTooLong] = (
            "Access token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s",
            "Navigate to Client Details → Advanced tab → Token, find 'Access Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.",
            "{\"maxLifetimeSeconds\": 3600}"
        ),

        [ConfigurationRuleKeys.ClientRefreshTokenLifetimeTooLong] = (
            "Client '{clientName}' refresh token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s",
            "Navigate to Client Details → Advanced tab → Token, find 'Refresh Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.",
            "{\"maxLifetimeSeconds\": 2592000}"
        ),

        [ConfigurationRuleKeys.ApiScopeNameMustStartWith] = (
            "API Scope '{actualName}' must start with one of: {allowedPrefixes}",
            "Navigate to API Scope Details → Basic Information section and rename the scope to start with one of the required prefixes: {allowedPrefixes}.",
            "{\"prefixes\": [\"scope_\"]}"
        ),

        [ConfigurationRuleKeys.ApiScopeNameMustNotContain] = (
            "API Scope '{scopeName}' contains forbidden string(s): {forbiddenStrings}",
            "Navigate to API Scope Details → Basic Information section and rename the scope to remove forbidden strings from the name.",
            "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}"
        ),

        [ConfigurationRuleKeys.ApiScopeMustHaveDisplayName] = (
            "API Scope is missing a display name",
            "Navigate to API Scope Details → Basic Information section and add a user-friendly Display Name.",
            null
        ),

        [ConfigurationRuleKeys.ApiResourceMustHaveScopes] = (
            "API Resource '{resourceName}' has {actualCount} scope(s), but requires at least {requiredCount}",
            "Navigate to API Resource Details → Scopes section and add at least one scope to this API Resource.",
            "{\"minScopes\": 1}"
        ),

        [ConfigurationRuleKeys.ApiResourceNameMustStartWith] = (
            "API Resource '{actualName}' must start with one of: {allowedPrefixes}",
            "Navigate to API Resource Details → Basic Information section and rename the resource to follow the naming convention.",
            "{\"prefixes\": [\"api.\"]}"
        ),

        [ConfigurationRuleKeys.IdentityResourceMustBeEnabled] = (
            "Required identity resource '{resourceName}' ({displayName}) is disabled",
            "Navigate to Identity Resource Details → Basic Information section and enable the 'Enabled' toggle.",
            "{\"requiredResources\": [\"openid\", \"profile\"]}"
        ),

        [ConfigurationRuleKeys.IdentityResourceNameMustStartWith] = (
            "Identity Resource '{actualName}' must start with one of: {allowedPrefixes}",
            "Navigate to Identity Resource Details → Basic Information section and rename the resource to follow the naming convention.",
            "{\"prefixes\": [\"custom.\"], \"excludeStandard\": true}"
        ),

        [ConfigurationRuleKeys.ScopeIsUnused] = (
            "API Scope '{scopeName}'{displayNameSuffix} is not used by any clients or API resources",
            "This API Scope '{scopeName}' is not used by any clients or API resources. Consider removing it from API Scopes list or assigning it to relevant clients/resources.",
            "{\"excludeScopes\": [\"openid\", \"profile\", \"email\", \"address\", \"phone\", \"offline_access\"]}"
        ),

        [ConfigurationRuleKeys.SecretIsExpiredInDays] = (
            "Client '{clientName}' has a secret ({secretType}) that {status} in {daysUntilExpiry} day(s) on {expirationDate}",
            "Navigate to Client Details → Advanced tab → Authentication → Secrets section, remove the expired secret and add a new one with proper expiration date.",
            "{\"warningDays\": 30, \"includeAlreadyExpired\": true}"
        ),

        [ConfigurationRuleKeys.ClientNameMustStartWith] = (
            "Client '{actualName}' must start with one of: {allowedPrefixes}",
            "Navigate to Client Details → Basics tab and rename the client to start with one of the required prefixes: {allowedPrefixes}.",
            "{\"prefixes\": [\"Client \"]}"
        ),

        [ConfigurationRuleKeys.ClientNameMustNotContain] = (
            "Client '{clientName}' contains forbidden string(s): {forbiddenStrings}",
            "Navigate to Client Details → Basics tab and rename the client to remove forbidden strings from the name.",
            "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}"
        ),

        [ConfigurationRuleKeys.ClientIdMustStartWith] = (
            "Client ID '{actualClientId}' must start with one of: {allowedPrefixes}",
            "Navigate to Client Details → Basics tab and rename the Client ID to start with one of the required prefixes: {allowedPrefixes}.",
            "{\"prefixes\": [\"client_\"]}"
        ),

        [ConfigurationRuleKeys.ClientIdMustNotContain] = (
            "Client ID '{clientId}' contains forbidden string(s): {forbiddenStrings}",
            "Navigate to Client Details → Basics tab and rename the Client ID to remove forbidden strings from it.",
            "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}"
        ),

        [ConfigurationRuleKeys.ClientScopeMustExist] = (
            "Client '{clientName}' allows {count} scope(s) that no longer exist: {missingScopes}",
            "Navigate to Client Details → Resources tab → Allowed Scopes section and remove the scope(s) that no longer exist: {missingScopes}.",
            "{\"excludeScopes\": [\"offline_access\"]}"
        ),

        [ConfigurationRuleKeys.ClientSigningAlgorithmsMustBeFapiCompliant] = (
            "Client '{clientName}' uses {count} signing algorithm(s) outside this deployment's FAPI 2.0 allow-list: {algorithms}",
            "Navigate to Client Details → Advanced tab → Token → Identity Token, find 'Allowed Identity Token Signing Algorithms' field and keep only {allowedAlgorithms}. If a JWK secret carries an algorithm outside this deployment's allow-list, regenerate the key in Client Details → Secrets tab and update the client application.",
            "{\"allowedAlgorithms\": [\"PS256\", \"ES256\"]}"
        ),

        [ConfigurationRuleKeys.ApiResourceSigningAlgorithmsMustBeFapiCompliant] = (
            "API Resource '{resourceName}' allows {count} access token signing algorithm(s) outside this deployment's FAPI 2.0 allow-list: {algorithms}",
            "Navigate to API Resource Details → Basic Information section, find 'Allowed Access Token Signing Algorithms' field and keep only {allowedAlgorithms}.",
            "{\"allowedAlgorithms\": [\"PS256\", \"ES256\"]}"
        )
    };

    public static (string MessageTemplate, string FixDescription, string Configuration) GetDefaultRuleData(string ruleType)
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
            (ConfigurationRuleKeys.ObsoleteImplicitGrant, ConfigurationResourceType.Client, ConfigurationIssueType.Error),
            (ConfigurationRuleKeys.ObsoletePasswordGrant, ConfigurationResourceType.Client, ConfigurationIssueType.Error),
            (ConfigurationRuleKeys.MissingPkce, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ClientMustHaveScopes, ConfigurationResourceType.Client, ConfigurationIssueType.Error),
            (ConfigurationRuleKeys.ApiResourceMustHaveScopes, ConfigurationResourceType.ApiResource, ConfigurationIssueType.Error)
        };

        // Default disabled rules (optional/configurable)
        var disabledRules = new[]
        {
            (ConfigurationRuleKeys.ClientRedirectUrisMustUseHttps, ConfigurationResourceType.Client, ConfigurationIssueType.Error),
            (ConfigurationRuleKeys.ClientAccessTokenLifetimeTooLong, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ClientRefreshTokenLifetimeTooLong, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ApiScopeNameMustStartWith, ConfigurationResourceType.ApiScope, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ApiScopeNameMustNotContain, ConfigurationResourceType.ApiScope, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ApiScopeMustHaveDisplayName, ConfigurationResourceType.ApiScope, ConfigurationIssueType.Recommendation),
            (ConfigurationRuleKeys.ApiResourceNameMustStartWith, ConfigurationResourceType.ApiResource, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.IdentityResourceMustBeEnabled, ConfigurationResourceType.IdentityResource, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.IdentityResourceNameMustStartWith, ConfigurationResourceType.IdentityResource, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ScopeIsUnused, ConfigurationResourceType.ApiScope, ConfigurationIssueType.Recommendation),
            (ConfigurationRuleKeys.SecretIsExpiredInDays, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),

            // Appended at the end - the seeded Ids of the rules above must stay stable
            (ConfigurationRuleKeys.ClientNameMustStartWith, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ClientNameMustNotContain, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ClientIdMustStartWith, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ClientIdMustNotContain, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ClientScopeMustExist, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ClientSigningAlgorithmsMustBeFapiCompliant, ConfigurationResourceType.Client, ConfigurationIssueType.Warning),
            (ConfigurationRuleKeys.ApiResourceSigningAlgorithmsMustBeFapiCompliant, ConfigurationResourceType.ApiResource, ConfigurationIssueType.Warning)
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
