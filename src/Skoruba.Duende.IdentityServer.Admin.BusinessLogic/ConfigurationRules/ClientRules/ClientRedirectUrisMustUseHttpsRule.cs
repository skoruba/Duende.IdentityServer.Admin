// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

public class ClientRedirectUrisMustUseHttpsRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ClientRedirectUrisMustUseHttps;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
    public override string DisplayName => "Client Redirect URIs Must Use HTTPS";
    public override string Description => "Ensures all client redirect URIs use HTTPS protocol for security.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Boolean("allowLocalhost", "Allow Localhost", "Allow HTTP for localhost and 127.0.0.1 addresses (useful for development)", defaultValue: true)
    ];

    public override string DefaultConfiguration => "{\"allowLocalhost\": true}";
    public override string ExampleConfiguration => "{\"allowLocalhost\": false}";
    public override string DefaultMessageTemplate => "Client has {count} non-HTTPS redirect URI(s): {uris}";
    public override string DefaultFixDescription => "Navigate to Client Details → URLs tab → Redirect URIs section and update all HTTP URIs to use HTTPS protocol.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
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
                    ResourceName = GetDisplayName(client.ClientName, client.ClientId),
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
