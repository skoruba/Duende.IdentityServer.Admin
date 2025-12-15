// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.IdentityResourceRules;

public class IdentityResourceMustBeEnabledRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public IdentityResourceMustBeEnabledRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<RequiredResourcesConfig>(configuration);
        var requiredResources = config.RequiredResources ?? new[] { "openid", "profile" };

        var disabledResources = await _dbContext.IdentityResources
            .Where(ir => requiredResources.Contains(ir.Name) && !ir.Enabled)
            .ToListAsync();

        var issues = new List<ConfigurationIssueView>();

        foreach (var resource in disabledResources)
        {
            var parameters = new Dictionary<string, string>
            {
                ["resourceName"] = resource.Name,
                ["displayName"] = resource.DisplayName ?? resource.Name
            };

            issues.Add(new ConfigurationIssueView
            {
                ResourceId = resource.Id,
                ResourceName = resource.DisplayName ?? resource.Name,
                Message = FormatMessage(messageTemplate, parameters),
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