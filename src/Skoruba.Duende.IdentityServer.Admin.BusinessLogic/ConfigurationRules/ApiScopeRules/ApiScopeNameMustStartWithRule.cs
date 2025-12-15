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

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;

public class ApiScopeNameMustStartWithRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ApiScopeNameMustStartWithRule(TDbContext dbContext)
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

        var scopes = await _dbContext.ApiScopes.ToListAsync();
        var issues = new List<ConfigurationIssueView>();

        foreach (var scope in scopes)
        {
            // Check if scope name starts with any of the allowed prefixes
            var startsWithAnyPrefix = prefixes.Any(prefix => scope.Name.StartsWith(prefix));

            if (!startsWithAnyPrefix)
            {
                var parameters = new Dictionary<string, string>
                {
                    ["allowedPrefixes"] = string.Join(", ", prefixes),
                    ["actualName"] = scope.Name
                };

                issues.Add(new ConfigurationIssueView
                {
                    ResourceId = scope.Id,
                    ResourceName = scope.Name,
                    Message = FormatMessage(messageTemplate, parameters),
                    IssueType = issueType,
                    ResourceType = ConfigurationResourceType.ApiScope,
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
