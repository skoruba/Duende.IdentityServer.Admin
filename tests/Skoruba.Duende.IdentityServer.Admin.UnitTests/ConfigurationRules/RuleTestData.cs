// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Duende.IdentityServer.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// The entities leave their collections null until EF loads them, while the rules
    /// read them without a guard - the builders hand over what a loaded entity looks like.
    /// </summary>
    internal static class RuleTestData
    {
        public static Client Client(
            string clientId = "client_under_test",
            string clientName = "Client Under Test",
            int id = 1,
            string[] scopes = null,
            string[] grantTypes = null,
            string[] redirectUris = null,
            ClientSecret[] secrets = null)
            => new()
            {
                Id = id,
                ClientId = clientId,
                ClientName = clientName,
                AllowedScopes = (scopes ?? []).Select(scope => new ClientScope { Scope = scope }).ToList(),
                AllowedGrantTypes = (grantTypes ?? []).Select(grantType => new ClientGrantType { GrantType = grantType }).ToList(),
                RedirectUris = (redirectUris ?? []).Select(uri => new ClientRedirectUri { RedirectUri = uri }).ToList(),
                ClientSecrets = (secrets ?? []).ToList()
            };

        public static ApiScope ApiScope(string name, string displayName = null, string description = null, int id = 1)
            => new() { Id = id, Name = name, DisplayName = displayName, Description = description };

        public static ApiResource ApiResource(string name, int id = 1, params string[] scopes)
            => new()
            {
                Id = id,
                Name = name,
                Scopes = scopes.Select(scope => new ApiResourceScope { Scope = scope }).ToList()
            };

        public static IdentityResource IdentityResource(string name, bool enabled = true, string displayName = null, int id = 1)
            => new() { Id = id, Name = name, Enabled = enabled, DisplayName = displayName };

        /// <summary>
        /// The templates carry no placeholders on purpose - what a rule puts into a
        /// message is asserted through <see cref="ConfigurationIssueView.MessageParameters"/>.
        /// </summary>
        public static List<ConfigurationIssueView> Validate(
            this IConfigurationRuleValidator rule,
            ValidationContext context,
            string configuration = null,
            ConfigurationIssueTypeView issueType = ConfigurationIssueTypeView.Warning)
            => rule.ValidateWithContext(context, configuration, "message", "fix", issueType);
    }
}
