// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;

public class ApiResourceNameMustStartWithRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ApiResourceNameMustStartWith;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.ApiResource;
    public override string DisplayName => "API Resource Name Must Start With";
    public override string Description => "Ensures API resource names follow a specific naming convention by requiring a prefix or one of multiple allowed prefixes.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("prefixes", "Required Prefixes", "The prefix(es) that API resource names must start with. A name has to start with at least one of them.", defaultValue: new[] { "api." }, required: true)
    ];

    public override string DefaultConfiguration => "{\"prefixes\": [\"api.\"]}";
    public override string ExampleConfiguration => "{\"prefixes\": [\"api.\", \"resource.\", \"service.\"]}";
    public override string DefaultMessageTemplate => "API Resource '{actualName}' must start with one of: {allowedPrefixes}";
    public override string DefaultFixDescription => "Navigate to API Resource Details → Basic Information section and rename the resource to follow the naming convention.";

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

        var apiResources = context.ApiResources;
        var issues = new List<ConfigurationIssueView>();

        foreach (var apiResource in apiResources)
        {
            // Check if API resource name starts with any of the allowed prefixes
            // Ordinal - a culture-sensitive comparison depends on the host, e.g. "ch" is a single letter under cs-CZ
            var startsWithAnyPrefix = prefixes.Any(prefix => apiResource.Name.StartsWith(prefix, System.StringComparison.Ordinal));

            if (!startsWithAnyPrefix)
            {
                var parameters = new Dictionary<string, string>
                {
                    ["allowedPrefixes"] = string.Join(", ", prefixes),
                    ["actualName"] = apiResource.Name
                };

                issues.Add(new ConfigurationIssueView
                {
                    ResourceId = apiResource.Id,
                    ResourceName = apiResource.Name,
                    Message = FormatMessage(messageTemplate, parameters),
                    FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
                    IssueType = issueType,
                    ResourceType = ConfigurationResourceType.ApiResource,
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
