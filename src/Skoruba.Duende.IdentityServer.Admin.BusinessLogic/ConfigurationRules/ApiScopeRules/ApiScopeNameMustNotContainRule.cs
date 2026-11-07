// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;

public class ApiScopeNameMustNotContainRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ApiScopeNameMustNotContain;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.ApiScope;
    public override string DisplayName => "API Scope Name Must Not Contain";
    public override string Description => "Ensures API scope names do not contain forbidden strings or characters.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("forbiddenStrings", "Forbidden Strings", "Array of strings that must not appear in scope names", defaultValue: new[] { "test", "temp", "debug" }, required: true)
    ];

    public override string DefaultConfiguration => "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}";
    public override string ExampleConfiguration => "{\"forbiddenStrings\": [\"admin\", \"internal\"]}";
    public override string DefaultMessageTemplate => "API Scope '{scopeName}' contains forbidden string(s): {forbiddenStrings}";
    public override string DefaultFixDescription => "Navigate to API Scope Details → Basic Information section and rename the scope to remove forbidden strings from the name.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ForbiddenConfig>(configuration);

        var forbiddenStrings = GetConfiguredValues(config.ForbiddenStrings);

        if (!forbiddenStrings.Any())
        {
            return new List<ConfigurationIssueView>();
        }

        var scopes = context.ApiScopes;
        var issues = new List<ConfigurationIssueView>();

        foreach (var scope in scopes)
        {
            var foundForbiddenStrings = forbiddenStrings
                .Where(forbidden => scope.Name.Contains(forbidden, System.StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (foundForbiddenStrings.Any())
            {
                var parameters = new Dictionary<string, string>
                {
                    ["scopeName"] = scope.Name,
                    ["forbiddenStrings"] = string.Join(", ", foundForbiddenStrings),
                    ["allForbiddenStrings"] = string.Join(", ", forbiddenStrings)
                };

                issues.Add(new ConfigurationIssueView
                {
                    ResourceId = scope.Id,
                    ResourceName = scope.Name,
                    Message = FormatMessage(messageTemplate, parameters),
                    FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
                    IssueType = issueType,
                    ResourceType = ConfigurationResourceType.ApiScope,
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
