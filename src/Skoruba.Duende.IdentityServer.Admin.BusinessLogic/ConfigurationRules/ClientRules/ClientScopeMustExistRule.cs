// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientScopeMustExistRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ClientScopeMustExist;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Client Scope Must Exist";
    public override string Description => "Detects clients that still allow a scope which no longer exists as an API scope or identity resource. An allowed scope is stored as a plain name, so deleting the scope leaves the client pointing at nothing.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("excludeScopes", "Exclude Scopes", "Scope names to ignore - protocol scopes such as offline_access are not stored as API scopes and would be reported otherwise", defaultValue: new[] { "offline_access" })
    ];

    public override string DefaultConfiguration => "{\"excludeScopes\": [\"offline_access\"]}";
    public override string ExampleConfiguration => "{\"excludeScopes\": [\"offline_access\", \"legacy_api\"]}";
    public override string DefaultMessageTemplate => "Client '{clientName}' allows {count} scope(s) that no longer exist: {missingScopes}";
    public override string DefaultFixDescription => "Navigate to Client Details → Resources tab → Allowed Scopes section and remove the scope(s) that no longer exist: {missingScopes}.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<MissingScopeConfig>(configuration);
        var excludeScopes = config.ExcludeScopes ?? new[] { "offline_access" };

        // An allowed scope is stored as a plain string - there is no foreign key that
        // would remove it once the api scope or identity resource behind it is deleted.
        var existingScopes = context.ApiScopes
            .Select(s => s.Name)
            .Union(context.IdentityResources.Select(r => r.Name))
            .ToHashSet();

        var clients = context.Clients;
        var issues = new List<ConfigurationIssueView>();

        foreach (var client in clients)
        {
            var missingScopes = client.AllowedScopes
                .Select(cs => cs.Scope)
                .Where(scope => !existingScopes.Contains(scope) &&
                                !excludeScopes.Contains(scope, StringComparer.OrdinalIgnoreCase))
                .Distinct()
                .ToList();

            if (missingScopes.Any())
            {
                var parameters = new Dictionary<string, string>
                {
                    ["clientName"] = GetDisplayName(client.ClientName, client.ClientId),
                    ["missingScopes"] = string.Join(", ", missingScopes),
                    ["count"] = missingScopes.Count.ToString()
                };

                issues.Add(new ConfigurationIssueView
                {
                    ResourceId = client.Id,
                    ResourceName = GetDisplayName(client.ClientName, client.ClientId),
                    Message = FormatMessage(messageTemplate, parameters),
                    FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
                    IssueType = issueType,
                    ResourceType = ConfigurationResourceType.Client,
                    MessageParameters = parameters
                });
            }
        }

        return issues;
    }

    private class MissingScopeConfig
    {
        public string[] ExcludeScopes { get; set; }
    }
}
