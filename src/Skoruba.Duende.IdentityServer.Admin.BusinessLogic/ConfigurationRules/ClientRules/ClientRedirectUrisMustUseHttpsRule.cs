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

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientRedirectUrisMustUseHttpsRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ClientRedirectUrisMustUseHttpsRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<HttpsConfig>(configuration);

        var clients = await _dbContext.Clients
            .Include(c => c.RedirectUris)
            .ToListAsync();

        var issues = new List<ConfigurationIssueView>();

        foreach (var client in clients)
        {
            var nonHttpsUris = client.RedirectUris
                .Where(uri =>
                {
                    var uriString = uri.RedirectUri?.ToLower() ?? "";
                    if (config.AllowLocalhost && (uriString.StartsWith("http://localhost") || uriString.StartsWith("http://127.0.0.1")))
                    {
                        return false;
                    }
                    return uriString.StartsWith("http://");
                })
                .Select(uri => uri.RedirectUri)
                .ToList();

            if (nonHttpsUris.Any())
            {
                var parameters = new Dictionary<string, string>
                {
                    ["uris"] = string.Join(", ", nonHttpsUris),
                    ["count"] = nonHttpsUris.Count.ToString()
                };

                issues.Add(new ConfigurationIssueView
                {
                    ResourceId = client.Id,
                    ResourceName = client.ClientName,
                    Message = FormatMessage(messageTemplate, parameters),
                    IssueType = issueType,
                    ResourceType = ConfigurationResourceType.Client,
                    MessageParameters = parameters
                });
            }
        }

        return issues;
    }

    private class HttpsConfig
    {
        public bool AllowLocalhost { get; set; } = true;
    }
}
