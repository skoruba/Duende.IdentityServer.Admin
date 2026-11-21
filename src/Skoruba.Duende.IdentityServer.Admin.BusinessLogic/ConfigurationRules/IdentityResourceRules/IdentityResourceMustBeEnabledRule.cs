// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.IdentityResourceRules;

public class IdentityResourceMustBeEnabledRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.IdentityResourceMustBeEnabled;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.IdentityResource;
    public override string DisplayName => "Identity Resource Must Be Enabled";
    public override string Description => "Detects disabled identity resources that should be enabled.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("requiredResources", "Required Resources", "List of identity resource names that must be enabled", defaultValue: new[] { "openid", "profile" })
    ];

    public override string DefaultConfiguration => "{\"requiredResources\": [\"openid\", \"profile\"]}";
    public override string ExampleConfiguration => "{\"requiredResources\": [\"openid\", \"profile\", \"email\"]}";
    public override string DefaultMessageTemplate => "Required identity resource '{resourceName}' ({displayName}) is disabled";
    public override string DefaultFixDescription => "Navigate to Identity Resource Details → Basic Information section and enable the 'Enabled' toggle.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<RequiredResourcesConfig>(configuration);
        var requiredResources = config.RequiredResources ?? new[] { "openid", "profile" };

        var disabledResources = context.IdentityResources
            .Where(ir => requiredResources.Contains(ir.Name) && !ir.Enabled)
            .ToList();

        var issues = new List<ConfigurationIssueView>();

        foreach (var resource in disabledResources)
        {
            var displayName = GetDisplayName(resource.DisplayName, resource.Name);
            var parameters = new Dictionary<string, string>
            {
                ["resourceName"] = resource.Name,
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

        return issues;
    }

    private class RequiredResourcesConfig
    {
        public string[] RequiredResources { get; set; }
    }
}
