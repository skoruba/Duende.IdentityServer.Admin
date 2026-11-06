// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientIdMustNotContainRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ClientIdMustNotContain;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Client ID Must Not Contain";
    public override string Description => "Ensures client identifiers do not contain forbidden strings or characters.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("forbiddenStrings", "Forbidden Strings", "Array of strings that must not appear in client identifiers", defaultValue: new[] { "test", "temp", "debug" }, required: true)
    ];

    public override string DefaultConfiguration => "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}";
    public override string ExampleConfiguration => "{\"forbiddenStrings\": [\"copy\", \"old\", \"deprecated\"]}";
    public override string DefaultMessageTemplate => "Client ID '{clientId}' contains forbidden string(s): {forbiddenStrings}";
    public override string DefaultFixDescription => "Navigate to Client Details → Basics tab and rename the Client ID to remove forbidden strings from it.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ForbiddenConfig>(configuration);

        var forbiddenStrings = GetConfiguredValues(config.ForbiddenStrings);

        if (!forbiddenStrings.Any())
        {
            return new List<ConfigurationIssueView>();
        }

        var clients = context.Clients;
        var issues = new List<ConfigurationIssueView>();

        foreach (var client in clients)
        {
            var foundForbiddenStrings = forbiddenStrings
                .Where(forbidden => client.ClientId.Contains(forbidden, System.StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (foundForbiddenStrings.Any())
            {
                var parameters = new Dictionary<string, string>
                {
                    ["clientId"] = client.ClientId,
                    ["forbiddenStrings"] = string.Join(", ", foundForbiddenStrings),
                    ["allForbiddenStrings"] = string.Join(", ", forbiddenStrings)
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

    private class ForbiddenConfig
    {
        public List<string> ForbiddenStrings { get; set; }
    }
}
