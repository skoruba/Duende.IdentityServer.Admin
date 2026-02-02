// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientRedirectUrisMustUseHttpsRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<HttpsConfig>(configuration);

        var clients = context.Clients;

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
                    FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
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
