// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientNameMustNotContainRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ClientNameMustNotContain;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Client Name Must Not Contain";
    public override string Description => "Ensures client names do not contain forbidden strings or characters. Clients without a name are skipped.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("forbiddenStrings", "Forbidden Strings", "Array of strings that must not appear in client names", defaultValue: new[] { "test", "temp", "debug" }, required: true)
    ];

    public override string DefaultConfiguration => "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}";
    public override string ExampleConfiguration => "{\"forbiddenStrings\": [\"copy\", \"old\", \"deprecated\"]}";
    public override string DefaultMessageTemplate => "Client '{clientName}' contains forbidden string(s): {forbiddenStrings}";
    public override string DefaultFixDescription => "Navigate to Client Details → Basics tab and rename the client to remove forbidden strings from the name.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ForbiddenConfig>(configuration);

        var forbiddenStrings = GetConfiguredValues(config.ForbiddenStrings);

        if (!forbiddenStrings.Any())
        {
            return new List<ConfigurationIssueView>();
        }

        // Client name is optional - clients without a name have nothing to validate
        var clients = context.Clients.Where(c => !string.IsNullOrWhiteSpace(c.ClientName));
        var issues = new List<ConfigurationIssueView>();

        foreach (var client in clients)
        {
            var foundForbiddenStrings = forbiddenStrings
                .Where(forbidden => (client.ClientName ?? string.Empty).Contains(forbidden, System.StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (foundForbiddenStrings.Any())
            {
                var parameters = new Dictionary<string, string>
                {
                    ["clientName"] = client.ClientName,
                    ["forbiddenStrings"] = string.Join(", ", foundForbiddenStrings),
                    ["allForbiddenStrings"] = string.Join(", ", forbiddenStrings)
                };

                issues.Add(new ConfigurationIssueView
                {
                    ResourceId = client.Id,
                    ResourceName = client.ClientName,
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
