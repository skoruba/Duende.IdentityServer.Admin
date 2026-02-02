// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

/// <summary>
/// Provides metadata and schema information for configuration rules
/// </summary>
public interface IConfigurationRuleMetadataProvider
{
    ConfigurationRuleMetadataDto GetMetadata(ConfigurationRuleType ruleType);
    List<ConfigurationRuleMetadataDto> GetAllMetadata();
}

public class ConfigurationRuleMetadataProvider : IConfigurationRuleMetadataProvider
{
    private readonly Dictionary<ConfigurationRuleType, ConfigurationRuleMetadataDto> _metadata;

    public ConfigurationRuleMetadataProvider()
    {
        _metadata = InitializeMetadata();
    }

    public ConfigurationRuleMetadataDto GetMetadata(ConfigurationRuleType ruleType)
    {
        return _metadata.TryGetValue(ruleType, out var metadata) ? metadata : null;
    }

    public List<ConfigurationRuleMetadataDto> GetAllMetadata()
    {
        return new List<ConfigurationRuleMetadataDto>(_metadata.Values);
    }

    private Dictionary<ConfigurationRuleType, ConfigurationRuleMetadataDto> InitializeMetadata()
    {
        return new Dictionary<ConfigurationRuleType, ConfigurationRuleMetadataDto>
        {
            // Client Rules
            [ConfigurationRuleType.ObsoleteImplicitGrant] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ObsoleteImplicitGrant),
                DisplayName = "Obsolete Implicit Grant",
                Description = "Detects clients using the obsolete implicit grant flow which is no longer recommended for security reasons.",
                ResourceType = nameof(ConfigurationResourceType.Client),
                Parameters = new List<ConfigurationRuleParameterDto>(),
                DefaultConfiguration = null,
                ExampleConfiguration = null,
                DefaultMessageTemplate = "Client uses obsolete implicit grant flow",
                DefaultFixDescription = "Navigate to Client Details → Advanced tab → Grant Types, remove 'implicit' and add 'authorization_code' instead."
            },

            [ConfigurationRuleType.ObsoletePasswordGrant] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ObsoletePasswordGrant),
                DisplayName = "Obsolete Password Grant",
                Description = "Detects clients using the obsolete resource owner password credentials grant flow.",
                ResourceType = nameof(ConfigurationResourceType.Client),
                Parameters = new List<ConfigurationRuleParameterDto>(),
                DefaultConfiguration = null,
                ExampleConfiguration = null,
                DefaultMessageTemplate = "Client uses obsolete password grant flow",
                DefaultFixDescription = "Navigate to Client Details → Advanced tab → Grant Types, remove 'password' and add 'authorization_code' or 'client_credentials' instead."
            },

            [ConfigurationRuleType.MissingPkce] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.MissingPkce),
                DisplayName = "Missing PKCE",
                Description = "Detects clients using authorization code flow without PKCE (Proof Key for Code Exchange).",
                ResourceType = nameof(ConfigurationResourceType.Client),
                Parameters = new List<ConfigurationRuleParameterDto>(),
                DefaultConfiguration = null,
                ExampleConfiguration = null,
                DefaultMessageTemplate = "Client uses authorization code flow without PKCE",
                DefaultFixDescription = "Navigate to Client Details → Advanced tab → Authentication, scroll down and enable 'Require Proof Key for Code Exchange (PKCE)' toggle."
            },

            [ConfigurationRuleType.ClientRedirectUrisMustUseHttps] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ClientRedirectUrisMustUseHttps),
                DisplayName = "Client Redirect URIs Must Use HTTPS",
                Description = "Ensures all client redirect URIs use HTTPS protocol for security.",
                ResourceType = nameof(ConfigurationResourceType.Client),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "allowLocalhost",
                        DisplayName = "Allow Localhost",
                        Description = "Allow HTTP for localhost and 127.0.0.1 addresses (useful for development)",
                        Type = "boolean",
                        Required = false,
                        DefaultValue = true
                    }
                },
                DefaultConfiguration = "{\"allowLocalhost\": true}",
                ExampleConfiguration = "{\"allowLocalhost\": false}",
                DefaultMessageTemplate = "Client has {count} non-HTTPS redirect URI(s): {uris}",
                DefaultFixDescription = "Navigate to Client Details → URLs tab → Redirect URIs section and update all HTTP URIs to use HTTPS protocol."
            },

            [ConfigurationRuleType.ClientAccessTokenLifetimeTooLong] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ClientAccessTokenLifetimeTooLong),
                DisplayName = "Client Access Token Lifetime Too Long",
                Description = "Detects clients with access token lifetime exceeding the recommended maximum.",
                ResourceType = nameof(ConfigurationResourceType.Client),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "maxLifetimeSeconds",
                        DisplayName = "Maximum Lifetime (seconds)",
                        Description = "Maximum allowed access token lifetime in seconds",
                        Type = "number",
                        Required = true,
                        DefaultValue = 3600,
                        MinValue = 300,
                        MaxValue = 86400
                    }
                },
                DefaultConfiguration = "{\"maxLifetimeSeconds\": 3600}",
                ExampleConfiguration = "{\"maxLifetimeSeconds\": 7200}",
                DefaultMessageTemplate = "Access token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s",
                DefaultFixDescription = "Navigate to Client Details → Advanced tab → Token, find 'Access Token Lifetime' field and reduce the value to {maxLifetime} seconds or less."
            },

            // API Scope Rules
            [ConfigurationRuleType.ApiScopeNameMustStartWith] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ApiScopeNameMustStartWith),
                DisplayName = "API Scope Name Must Start With",
                Description = "Ensures API scope names follow a specific naming convention by requiring a prefix or one of multiple allowed prefixes.",
                ResourceType = nameof(ConfigurationResourceType.ApiScope),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "prefixes",
                        DisplayName = "Required Prefixes",
                        Description = "The prefix(es) that API scope names must start with. Can be a single string or an array of strings.",
                        Type = "array",
                        Required = true,
                        DefaultValue = new[] { "scope_" }
                    }
                },
                DefaultConfiguration = "{\"prefixes\": [\"scope_\"]}",
                ExampleConfiguration = "{\"prefixes\": [\"api.\", \"scope_\", \"resource.\"]}",
                DefaultMessageTemplate = "API Scope '{actualName}' must start with one of: {allowedPrefixes}",
                DefaultFixDescription = "Navigate to API Scope Details → Basic Information section and rename the scope to start with one of the required prefixes: {allowedPrefixes}."
            },

            [ConfigurationRuleType.ApiScopeNameMustNotContain] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ApiScopeNameMustNotContain),
                DisplayName = "API Scope Name Must Not Contain",
                Description = "Ensures API scope names do not contain forbidden strings or characters.",
                ResourceType = nameof(ConfigurationResourceType.ApiScope),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "forbiddenStrings",
                        DisplayName = "Forbidden Strings",
                        Description = "Array of strings that must not appear in scope names",
                        Type = "array",
                        Required = true,
                        DefaultValue = new[] { "test", "temp", "debug" }
                    }
                },
                DefaultConfiguration = "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}",
                ExampleConfiguration = "{\"forbiddenStrings\": [\"admin\", \"internal\"]}",
                DefaultMessageTemplate = "API Scope '{scopeName}' contains forbidden string(s): {forbiddenStrings}",
                DefaultFixDescription = "Navigate to API Scope Details → Basic Information section and rename the scope to remove forbidden strings from the name."
            },

            [ConfigurationRuleType.ApiScopeMustHaveDisplayName] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ApiScopeMustHaveDisplayName),
                DisplayName = "API Scope Must Have Display Name",
                Description = "Ensures all API scopes have a user-friendly display name.",
                ResourceType = nameof(ConfigurationResourceType.ApiScope),
                Parameters = new List<ConfigurationRuleParameterDto>(),
                DefaultConfiguration = null,
                ExampleConfiguration = null,
                DefaultMessageTemplate = "API Scope is missing a display name",
                DefaultFixDescription = "Navigate to API Scope Details → Basic Information section and add a user-friendly Display Name."
            },

            // API Resource Rules
            [ConfigurationRuleType.ApiResourceMustHaveScopes] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ApiResourceMustHaveScopes),
                DisplayName = "API Resource Must Have Scopes",
                Description = "Ensures all API resources have at least one associated scope.",
                ResourceType = nameof(ConfigurationResourceType.ApiResource),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "minScopes",
                        DisplayName = "Minimum Scopes",
                        Description = "Minimum number of scopes required",
                        Type = "number",
                        Required = false,
                        DefaultValue = 1,
                        MinValue = 1,
                        MaxValue = 100
                    }
                },
                DefaultConfiguration = "{\"minScopes\": 1}",
                ExampleConfiguration = "{\"minScopes\": 2}",
                DefaultMessageTemplate = "API Resource '{resourceName}' has {actualCount} scope(s), but requires at least {requiredCount}",
                DefaultFixDescription = "Navigate to API Resource Details → Scopes section and add at least one scope to this API Resource."
            },

            [ConfigurationRuleType.ApiResourceNameMustStartWith] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ApiResourceNameMustStartWith),
                DisplayName = "API Resource Name Must Start With",
                Description = "Ensures API resource names follow a specific naming convention by requiring a prefix or one of multiple allowed prefixes.",
                ResourceType = nameof(ConfigurationResourceType.ApiResource),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "prefixes",
                        DisplayName = "Required Prefixes",
                        Description = "The prefix(es) that API resource names must start with. Can be a single string or an array of strings.",
                        Type = "array",
                        Required = true,
                        DefaultValue = new[] { "api." }
                    }
                },
                DefaultConfiguration = "{\"prefixes\": [\"api.\"]}",
                ExampleConfiguration = "{\"prefixes\": [\"api.\", \"resource.\", \"service.\"]}",
                DefaultMessageTemplate = "API Resource '{actualName}' must start with one of: {allowedPrefixes}",
                DefaultFixDescription = "Navigate to API Resource Details → Basic Information section and rename the resource to follow the naming convention."
            },

            // Identity Resource Rules
            [ConfigurationRuleType.IdentityResourceMustBeEnabled] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.IdentityResourceMustBeEnabled),
                DisplayName = "Identity Resource Must Be Enabled",
                Description = "Detects disabled identity resources that should be enabled.",
                ResourceType = nameof(ConfigurationResourceType.IdentityResource),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "requiredResources",
                        DisplayName = "Required Resources",
                        Description = "List of identity resource names that must be enabled",
                        Type = "array",
                        Required = false,
                        DefaultValue = new[] { "openid", "profile" }
                    }
                },
                DefaultConfiguration = "{\"requiredResources\": [\"openid\", \"profile\"]}",
                ExampleConfiguration = "{\"requiredResources\": [\"openid\", \"profile\", \"email\"]}",
                DefaultMessageTemplate = "Required identity resource '{resourceName}' ({displayName}) is disabled",
                DefaultFixDescription = "Navigate to Identity Resource Details → Basic Information section and enable the 'Enabled' toggle."
            },

            [ConfigurationRuleType.IdentityResourceNameMustStartWith] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.IdentityResourceNameMustStartWith),
                DisplayName = "Identity Resource Name Must Start With",
                Description = "Ensures identity resource names follow a naming convention by requiring a prefix or one of multiple allowed prefixes.",
                ResourceType = nameof(ConfigurationResourceType.IdentityResource),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "prefixes",
                        DisplayName = "Required Prefixes",
                        Description = "The prefix(es) that identity resource names must start with. Can be a single string or an array of strings.",
                        Type = "array",
                        Required = true,
                        DefaultValue = new[] { "custom." }
                    },
                    new ConfigurationRuleParameterDto
                    {
                        Name = "excludeStandard",
                        DisplayName = "Exclude Standard Resources",
                        Description = "Exclude standard OIDC resources (openid, profile, email, etc.) from this rule",
                        Type = "boolean",
                        Required = false,
                        DefaultValue = true
                    }
                },
                DefaultConfiguration = "{\"prefixes\": [\"custom.\"], \"excludeStandard\": true}",
                ExampleConfiguration = "{\"prefixes\": [\"app.\", \"custom.\"], \"excludeStandard\": false}",
                DefaultMessageTemplate = "Identity Resource '{actualName}' must start with one of: {allowedPrefixes}",
                DefaultFixDescription = "Navigate to Identity Resource Details → Basic Information section and rename the resource to follow the naming convention."
            },

            // Additional Client Rules
            [ConfigurationRuleType.ClientMustHaveScopes] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ClientMustHaveScopes),
                DisplayName = "Client Must Have Scopes",
                Description = "Ensures clients have at least one allowed scope configured.",
                ResourceType = nameof(ConfigurationResourceType.Client),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "minScopes",
                        DisplayName = "Minimum Scopes",
                        Description = "Minimum number of scopes required",
                        Type = "number",
                        Required = false,
                        DefaultValue = 1,
                        MinValue = 0,
                        MaxValue = 100
                    }
                },
                DefaultConfiguration = "{\"minScopes\": 1}",
                ExampleConfiguration = "{\"minScopes\": 3}",
                DefaultMessageTemplate = "Client '{clientName}' has {actualCount} allowed scope(s), but requires at least {requiredCount}",
                DefaultFixDescription = "Navigate to Client Details → Resources tab → Allowed Scopes section and add at least one scope from the available list."
            },

            [ConfigurationRuleType.ClientRefreshTokenLifetimeTooLong] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ClientRefreshTokenLifetimeTooLong),
                DisplayName = "Client Refresh Token Lifetime Too Long",
                Description = "Detects clients with refresh token lifetime exceeding the recommended maximum.",
                ResourceType = nameof(ConfigurationResourceType.Client),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "maxLifetimeSeconds",
                        DisplayName = "Maximum Lifetime (seconds)",
                        Description = "Maximum allowed refresh token lifetime in seconds",
                        Type = "number",
                        Required = true,
                        DefaultValue = 2592000, // 30 days
                        MinValue = 3600,
                        MaxValue = 31536000 // 1 year
                    }
                },
                DefaultConfiguration = "{\"maxLifetimeSeconds\": 2592000}",
                ExampleConfiguration = "{\"maxLifetimeSeconds\": 7776000}",
                DefaultMessageTemplate = "Client '{clientName}' refresh token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s",
                DefaultFixDescription = "Navigate to Client Details → Advanced tab → Token, find 'Refresh Token Lifetime' field and reduce the value to {maxLifetime} seconds or less."
            },

            // Security Rules
            [ConfigurationRuleType.ScopeIsUnused] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ScopeIsUnused),
                DisplayName = "Scope Is Unused",
                Description = "Detects API scopes that are not used by any clients or API resources, which may indicate unnecessary scopes that can be removed.",
                ResourceType = nameof(ConfigurationResourceType.ApiScope),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "excludeScopes",
                        DisplayName = "Exclude Scopes",
                        Description = "List of scope names to exclude from unused scope detection (e.g., standard OIDC scopes)",
                        Type = "array",
                        Required = false,
                        DefaultValue = new[] { "openid", "profile", "email", "address", "phone", "offline_access" }
                    }
                },
                DefaultConfiguration = "{\"excludeScopes\": [\"openid\", \"profile\", \"email\", \"address\", \"phone\", \"offline_access\"]}",
                ExampleConfiguration = "{\"excludeScopes\": [\"openid\", \"profile\", \"admin\", \"system\"]}",
                DefaultMessageTemplate = "API Scope '{scopeName}'{displayNameSuffix} is not used by any clients or API resources",
                DefaultFixDescription = "This API Scope '{scopeName}' is not used by any clients or API resources. Consider removing it from API Scopes list or assigning it to relevant clients/resources."
            },

            [ConfigurationRuleType.SecretIsExpiredInDays] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.SecretIsExpiredInDays),
                DisplayName = "Secret Is Expired In Days",
                Description = "Detects client secrets that are expired or will expire within a specified number of days, helping prevent authentication failures.",
                ResourceType = nameof(ConfigurationResourceType.Client),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "warningDays",
                        DisplayName = "Warning Days",
                        Description = "Number of days before expiration to start warning",
                        Type = "number",
                        Required = false,
                        DefaultValue = 30,
                        MinValue = 1,
                        MaxValue = 365
                    },
                    new ConfigurationRuleParameterDto
                    {
                        Name = "includeAlreadyExpired",
                        DisplayName = "Include Already Expired",
                        Description = "Include secrets that are already expired",
                        Type = "boolean",
                        Required = false,
                        DefaultValue = true
                    }
                },
                DefaultConfiguration = "{\"warningDays\": 30, \"includeAlreadyExpired\": true}",
                ExampleConfiguration = "{\"warningDays\": 14, \"includeAlreadyExpired\": false}",
                DefaultMessageTemplate = "Client '{clientName}' has a secret ({secretType}) that {status} in {daysUntilExpiry} day(s) on {expirationDate}",
                DefaultFixDescription = "Navigate to Client Details → Advanced tab → Authentication → Secrets section, remove the expired secret and add a new one with proper expiration date."
            }
        };
    }
}
