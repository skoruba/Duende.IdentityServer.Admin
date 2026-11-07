// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.IdentityResourceRules;

public class IdentityResourceNameMustStartWithRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.IdentityResourceNameMustStartWith;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.IdentityResource;
    public override string DisplayName => "Identity Resource Name Must Start With";
    public override string Description => "Ensures identity resource names follow a naming convention by requiring a prefix or one of multiple allowed prefixes.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("prefixes", "Required Prefixes", "The prefix(es) that identity resource names must start with. A name has to start with at least one of them.", defaultValue: new[] { "custom." }, required: true),
        ConfigurationRuleParameter.Boolean("excludeStandard", "Exclude Standard Resources", "Exclude standard OIDC resources (openid, profile, email, etc.) from this rule", defaultValue: true)
    ];

    public override string DefaultConfiguration => "{\"prefixes\": [\"custom.\"], \"excludeStandard\": true}";
    public override string ExampleConfiguration => "{\"prefixes\": [\"app.\", \"custom.\"], \"excludeStandard\": false}";
    public override string DefaultMessageTemplate => "Identity Resource '{actualName}' must start with one of: {allowedPrefixes}";
    public override string DefaultFixDescription => "Navigate to Identity Resource Details → Basic Information section and rename the resource to follow the naming convention.";

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

        var excludeStandard = config.ExcludeStandard ?? true;
        var standardResources = new[] { "openid", "profile", "email", "address", "phone", "offline_access" };

        var identityResources = context.IdentityResources;
        var issues = new List<ConfigurationIssueView>();

        foreach (var resource in identityResources)
        {
            // Skip standard OIDC resources if excludeStandard is true
            if (excludeStandard && standardResources.Contains(resource.Name.ToLowerInvariant()))
            {
                continue;
            }

            // Check if identity resource name starts with any of the allowed prefixes
            // Ordinal - a culture-sensitive comparison depends on the host, e.g. "ch" is a single letter under cs-CZ
            var startsWithAnyPrefix = prefixes.Any(prefix => resource.Name.StartsWith(prefix, System.StringComparison.Ordinal));

            if (!startsWithAnyPrefix)
            {
                var displayName = GetDisplayName(resource.DisplayName, resource.Name);
                var parameters = new Dictionary<string, string>
                {
                    ["allowedPrefixes"] = string.Join(", ", prefixes),
                    ["actualName"] = resource.Name,
                    ["displayName"] = displayName
                };

                issues.Add(new ConfigurationIssueView
                {
                    ResourceId = resource.Id,
                    ResourceName = displayName,
                    Message = FormatMessage(messageTemplate, parameters),
                    FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
                    IssueType = issueType,
                    ResourceType = ConfigurationResourceType.IdentityResource,
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
        public bool? ExcludeStandard { get; set; }
    }
}
