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
                DefaultFixDescription = "Go to the client details → Advanced → Grant Types and replace 'implicit' with 'authorization_code'."
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
                DefaultFixDescription = "Go to the client details → Advanced → Grant Types and replace 'password' with 'authorization_code' or 'client_credentials'."
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
                DefaultFixDescription = "This client does not use PKCE. Consider enabling PKCE for enhanced security."
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
                DefaultMessageTemplate = "Client has redirect URIs not using HTTPS",
                DefaultFixDescription = "Update redirect URIs to use HTTPS protocol. For production environments, HTTP is not secure."
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
                DefaultMessageTemplate = "Client access token lifetime exceeds recommended maximum",
                DefaultFixDescription = "Go to client details → Token and reduce the Access Token Lifetime to the recommended maximum value."
            },

            // API Scope Rules
            [ConfigurationRuleType.ApiScopeNameMustStartWith] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ApiScopeNameMustStartWith),
                DisplayName = "API Scope Name Must Start With",
                Description = "Ensures API scope names follow a specific naming convention by requiring a prefix.",
                ResourceType = nameof(ConfigurationResourceType.ApiScope),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "prefix",
                        DisplayName = "Required Prefix",
                        Description = "The prefix that all API scope names must start with",
                        Type = "string",
                        Required = true,
                        Pattern = "^[a-zA-Z0-9._-]+$"
                    }
                },
                DefaultConfiguration = "{\"prefix\": \"scope_\"}",
                ExampleConfiguration = "{\"prefix\": \"api.\"}",
                DefaultMessageTemplate = "API Scope name must start with specified prefix",
                DefaultFixDescription = "Rename the API Scope to follow the naming convention starting with the required prefix."
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
                DefaultMessageTemplate = "API Scope name contains forbidden strings",
                DefaultFixDescription = "Rename the API Scope to remove forbidden strings from the name."
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
                DefaultFixDescription = "Go to API Scope details and add a user-friendly Display Name."
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
                DefaultMessageTemplate = "API Resource must have at least one scope",
                DefaultFixDescription = "Go to API Resource details → Scopes and add at least one scope."
            },

            [ConfigurationRuleType.ApiResourceNameMustStartWith] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ApiResourceNameMustStartWith),
                DisplayName = "API Resource Name Must Start With",
                Description = "Ensures API resource names follow a specific naming convention.",
                ResourceType = nameof(ConfigurationResourceType.ApiResource),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "prefix",
                        DisplayName = "Required Prefix",
                        Description = "The prefix that all API resource names must start with",
                        Type = "string",
                        Required = true,
                        Pattern = "^[a-zA-Z0-9._-]+$"
                    }
                },
                DefaultConfiguration = "{\"prefix\": \"api.\"}",
                ExampleConfiguration = "{\"prefix\": \"resource.\"}",
                DefaultMessageTemplate = "API Resource name must start with specified prefix",
                DefaultFixDescription = "Rename the API Resource to follow the naming convention."
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
                DefaultMessageTemplate = "Required identity resource is disabled",
                DefaultFixDescription = "Go to Identity Resource details and enable this resource."
            },

            [ConfigurationRuleType.IdentityResourceNameMustStartWith] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.IdentityResourceNameMustStartWith),
                DisplayName = "Identity Resource Name Must Start With",
                Description = "Ensures identity resource names follow a naming convention.",
                ResourceType = nameof(ConfigurationResourceType.IdentityResource),
                Parameters = new List<ConfigurationRuleParameterDto>
                {
                    new ConfigurationRuleParameterDto
                    {
                        Name = "prefix",
                        DisplayName = "Required Prefix",
                        Description = "The prefix that identity resource names must start with",
                        Type = "string",
                        Required = true,
                        Pattern = "^[a-zA-Z0-9._-]+$"
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
                DefaultConfiguration = "{\"prefix\": \"custom.\", \"excludeStandard\": true}",
                ExampleConfiguration = "{\"prefix\": \"app.\", \"excludeStandard\": false}",
                DefaultMessageTemplate = "Identity Resource name must start with specified prefix",
                DefaultFixDescription = "Rename the Identity Resource to follow the naming convention."
            },

            // Additional Client Rules
            [ConfigurationRuleType.ClientMustHaveAllowedScopes] = new ConfigurationRuleMetadataDto
            {
                RuleType = nameof(ConfigurationRuleType.ClientMustHaveAllowedScopes),
                DisplayName = "Client Must Have Allowed Scopes",
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
                DefaultMessageTemplate = "Client must have at least one allowed scope",
                DefaultFixDescription = "Go to client details → Scopes and add allowed scopes."
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
                DefaultMessageTemplate = "Client refresh token lifetime exceeds recommended maximum",
                DefaultFixDescription = "Go to client details → Token and reduce the Refresh Token Lifetime."
            }
        };
    }
}
