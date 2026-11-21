// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;

public class ApiResourceMustHaveScopesRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ApiResourceMustHaveScopes;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.ApiResource;
    public override string DisplayName => "API Resource Must Have Scopes";
    public override string Description => "Ensures all API resources have at least one associated scope.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Number("minScopes", "Minimum Scopes", "Minimum number of scopes required", defaultValue: 1, minValue: 1, maxValue: 100)
    ];

    public override string DefaultConfiguration => "{\"minScopes\": 1}";
    public override string ExampleConfiguration => "{\"minScopes\": 2}";
    public override string DefaultMessageTemplate => "API Resource '{resourceName}' has {actualCount} scope(s), but requires at least {requiredCount}";
    public override string DefaultFixDescription => "Navigate to API Resource Details → Scopes section and add at least one scope to this API Resource.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<ScopesConfig>(configuration);
        var minScopes = config.MinScopes ?? 1;

        var apiResources = context.ApiResources
            .Where(ar => ar.Scopes.Count < minScopes)
            .ToList();

        var issues = new List<ConfigurationIssueView>();

        foreach (var apiResource in apiResources)
        {
            var parameters = new Dictionary<string, string>
            {
                ["resourceName"] = apiResource.Name,
                ["actualCount"] = apiResource.Scopes.Count.ToString(),
                ["requiredCount"] = minScopes.ToString()
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

        return issues;
    }

    private class ScopesConfig
    {
        public int? MinScopes { get; set; }
    }
}
