// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.Api.ConfigurationRules
{
    /// <summary>
    /// A custom configuration rule of this deployment, next to the built-in ones. Every rule in this
    /// project is registered by <c>AddConfigurationRulesFromAssemblyContaining&lt;Startup&gt;</c> in
    /// <see cref="Startup"/>, so another rule is just another class in this folder. The Admin UI offers
    /// it under Configuration Rules → Add New Rule; no migration is involved.
    /// </summary>
    public class ClientSecretMustExpireWithinOneYearRule
        : ConfigurationRuleBase<ClientSecretMustExpireWithinOneYearRule.Configuration>
    {
        public override string Key => "Contoso.ClientSecretMustExpireWithinOneYear";
        public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
        public override string DisplayName => "Client Secret Must Expire Within One Year";
        public override string Description => "Detects client secrets without an expiration or with one further away than the limit.";
        public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
        [
            ConfigurationRuleParameter.Number("maxDays", "Maximum Days", "Days a secret may stay valid", defaultValue: 365, minValue: 1)
        ];
        public override string DefaultConfiguration => "{\"maxDays\": 365}";
        public override string DefaultMessageTemplate => "Client '{clientName}' has a secret that expires {expiration}, the limit is {maxDays} days";
        public override string DefaultFixDescription => "Set the expiration of the secret to at most {maxDays} days from now.";

        protected override IEnumerable<ConfigurationIssueView> Validate(ValidationContext context, Configuration configuration)
        {
            var maxDays = configuration.MaxDays ?? 365;
            var limit = DateTime.UtcNow.AddDays(maxDays);

            foreach (var client in context.Clients)
            foreach (var secret in client.ClientSecrets.Where(s => s.Expiration == null || s.Expiration > limit))
            {
                yield return Issue(client, new Dictionary<string, string>
                {
                    ["clientName"] = GetDisplayName(client.ClientName, client.ClientId),
                    ["expiration"] = secret.Expiration?.ToString("yyyy-MM-dd") ?? "never",
                    ["maxDays"] = maxDays.ToString()
                });
            }
        }

        public class Configuration
        {
            public int? MaxDays { get; set; }
        }
    }
}
