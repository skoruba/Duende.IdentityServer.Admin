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

public class IdentityResourceNameMustStartWithRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public IdentityResourceNameMustStartWithRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<PrefixConfig>(configuration);

        // Support both single prefix (backward compatibility) and array of prefixes
        var prefixes = new List<string>();

        if (config.Prefixes != null && config.Prefixes.Any())
        {
            prefixes = config.Prefixes.ToList();
        }
        else if (!string.IsNullOrWhiteSpace(config.Prefix))
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

        var identityResources = await _dbContext.IdentityResources.ToListAsync();
        var issues = new List<ConfigurationIssueView>();

        foreach (var resource in identityResources)
        {
            // Skip standard OIDC resources if excludeStandard is true
            if (excludeStandard && standardResources.Contains(resource.Name.ToLowerInvariant()))
            {
                continue;
            }

            // Check if identity resource name starts with any of the allowed prefixes
            var startsWithAnyPrefix = prefixes.Any(prefix => resource.Name.StartsWith(prefix));

            if (!startsWithAnyPrefix)
            {
                var parameters = new Dictionary<string, string>
                {
                    ["allowedPrefixes"] = string.Join(", ", prefixes),
                    ["actualName"] = resource.Name,
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