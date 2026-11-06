// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientIdMustStartWithRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ClientIdMustStartWith;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Client ID Must Start With";
    public override string Description => "Ensures client identifiers follow a specific naming convention by requiring a prefix or one of multiple allowed prefixes.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("prefixes", "Required Prefixes", "The prefix(es) that client identifiers must start with. A name has to start with at least one of them.", defaultValue: new[] { "client_" }, required: true)
    ];

    public override string DefaultConfiguration => "{\"prefixes\": [\"client_\"]}";
    public override string ExampleConfiguration => "{\"prefixes\": [\"spa.\", \"mvc.\", \"api.\"]}";
    public override string DefaultMessageTemplate => "Client ID '{actualClientId}' must start with one of: {allowedPrefixes}";
    public override string DefaultFixDescription => "Navigate to Client Details → Basics tab and rename the Client ID to start with one of the required prefixes: {allowedPrefixes}.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<PrefixConfig>(configuration);

        // Support both single prefix (backward compatibility) and array of prefixes
        var prefixes = GetConfiguredValues(config.Prefixes);

        if (!prefixes.Any() && !string.IsNullOrWhiteSpace(config.Prefix))
        {
            // Backward compatibility: single prefix as string
            prefixes.Add(config.Prefix);
        }

        if (!prefixes.Any())
        {
            return new List<ConfigurationIssueView>();
        }

        var clients = context.Clients;
        var issues = new List<ConfigurationIssueView>();

        foreach (var client in clients)
        {
            // Check if client id starts with any of the allowed prefixes
            // Ordinal - a culture-sensitive comparison depends on the host, e.g. "ch" is a single letter under cs-CZ
            var startsWithAnyPrefix = prefixes.Any(prefix => client.ClientId.StartsWith(prefix, System.StringComparison.Ordinal));

            if (!startsWithAnyPrefix)
            {
                var parameters = new Dictionary<string, string>
                {
                    ["allowedPrefixes"] = string.Join(", ", prefixes),
                    ["actualClientId"] = client.ClientId
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

    private class PrefixConfig
    {
        public string Prefix { get; set; } // Backward compatibility
        public List<string> Prefixes { get; set; } // New: support multiple prefixes
    }
}
