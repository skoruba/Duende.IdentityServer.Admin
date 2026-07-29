// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientNameMustNotContainRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ForbiddenConfig>(configuration);

        if (config.ForbiddenStrings == null || !config.ForbiddenStrings.Any())
        {
            return new List<ConfigurationIssueView>();
        }

        // Client name is optional - clients without a name have nothing to validate
        var clients = context.Clients.Where(c => !string.IsNullOrWhiteSpace(c.ClientName));
        var issues = new List<ConfigurationIssueView>();

        foreach (var client in clients)
        {
            var foundForbiddenStrings = config.ForbiddenStrings
                .Where(forbidden => client.ClientName.Contains(forbidden, System.StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (foundForbiddenStrings.Any())
            {
                var parameters = new Dictionary<string, string>
                {
                    ["clientName"] = client.ClientName,
                    ["forbiddenStrings"] = string.Join(", ", foundForbiddenStrings),
                    ["allForbiddenStrings"] = string.Join(", ", config.ForbiddenStrings)
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
