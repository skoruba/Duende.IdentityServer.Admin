// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;

/// <summary>
/// Reports API resources whose allowed access token signing algorithms fall outside the
/// FAPI 2.0 Security Profile - see <see cref="FapiSigningAlgorithms"/> for the allowed set.
///
/// The access token algorithm is decided by the API resource, not the client: IdentityServer
/// signs every access token issued for the resource's scopes with one of these algorithms,
/// so a single non-conformant resource affects every client that requests it. An empty
/// list means the server default, which the STS profile controls, and is not reported.
/// </summary>
public class ApiResourceSigningAlgorithmsMustBeFapiCompliantRule : ConfigurationRuleBase
{
    public override string Key => ConfigurationRuleKeys.ApiResourceSigningAlgorithmsMustBeFapiCompliant;
    public override ConfigurationResourceType ResourceType => ConfigurationResourceType.ApiResource;
    public override string DisplayName => "API Resource Signing Algorithms Must Be FAPI 2.0 Compliant";
    public override string Description => "Detects API resources whose allowed access token signing algorithms fall outside this deployment's FAPI 2.0 allow-list. The access token algorithm is decided by the API resource, not the client - every access token issued for the resource's scopes is signed with one of these algorithms, so a single non-conformant resource affects every client requesting it. An empty list means the server default and is not reported.";

    public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
    [
        ConfigurationRuleParameter.Array("allowedAlgorithms", "Allowed Algorithms", "Signing algorithms enabled by this deployment's FAPI profile. Defaults to PS256 and ES256; FAPI also permits EdDSA (Ed25519), but enable it here only after configuring compatible validation support.", defaultValue: new[] { "PS256", "ES256" })
    ];

    public override string DefaultConfiguration => "{\"allowedAlgorithms\": [\"PS256\", \"ES256\"]}";
    public override string ExampleConfiguration => "{\"allowedAlgorithms\": [\"PS256\", \"ES256\", \"EdDSA\"]}";
    public override string DefaultMessageTemplate => "API Resource '{resourceName}' allows {count} access token signing algorithm(s) outside this deployment's FAPI 2.0 allow-list: {algorithms}";
    public override string DefaultFixDescription => "Navigate to API Resource Details → Basic Information section, find 'Allowed Access Token Signing Algorithms' field and keep only {allowedAlgorithms}.";

    public override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<FapiSigningAlgorithmsConfig>(configuration);
        var allowedAlgorithms = FapiSigningAlgorithms.ReadAllowedAlgorithms(config);

        var issues = new List<ConfigurationIssueView>();

        if (allowedAlgorithms.Count == 0)
        {
            return issues;
        }

        foreach (var apiResource in context.ApiResources)
        {
            var offendingAlgorithms = FapiSigningAlgorithms.ParseAlgorithmList(apiResource.AllowedAccessTokenSigningAlgorithms)
                .Where(algorithm => !allowedAlgorithms.Contains(algorithm))
                .Distinct(FapiSigningAlgorithms.Comparer)
                .ToList();

            if (offendingAlgorithms.Count == 0)
            {
                continue;
            }

            var parameters = new Dictionary<string, string>
            {
                ["algorithms"] = string.Join(", ", offendingAlgorithms),
                ["count"] = offendingAlgorithms.Count.ToString(),
                ["allowedAlgorithms"] = string.Join(", ", allowedAlgorithms),
                ["resourceName"] = apiResource.Name
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
}
