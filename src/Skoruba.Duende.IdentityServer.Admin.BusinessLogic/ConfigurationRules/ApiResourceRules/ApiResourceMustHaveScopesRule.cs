// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;

public class ApiResourceMustHaveScopesRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
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
