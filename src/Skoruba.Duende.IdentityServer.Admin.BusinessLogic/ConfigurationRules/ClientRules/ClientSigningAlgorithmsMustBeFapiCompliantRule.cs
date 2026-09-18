// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Duende.IdentityServer.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;

/// <summary>
/// Reports clients that sign with an algorithm the FAPI 2.0 Security Profile does not
/// permit - see <see cref="FapiSigningAlgorithms"/> for the allowed set.
///
/// Both the allowed identity token signing algorithms and the algorithm embedded in
/// JWK secrets are checked, since a client can be non-conformant through either.
/// Access token algorithms are configured on the API resource and are covered by
/// <see cref="ApiResourceRules.ApiResourceSigningAlgorithmsMustBeFapiCompliantRule"/>.
/// </summary>
public class ClientSigningAlgorithmsMustBeFapiCompliantRule : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
{
    private const string JwkSecretType = "JWK";

    public List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration, string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var config = DeserializeConfiguration<FapiSigningAlgorithmsConfig>(configuration);
        var allowedAlgorithms = FapiSigningAlgorithms.ReadAllowedAlgorithms(config);

        var issues = new List<ConfigurationIssueView>();

        if (allowedAlgorithms.Count == 0)
        {
            return issues;
        }

        foreach (var client in context.Clients)
        {
            var offendingAlgorithms = FapiSigningAlgorithms.ParseAlgorithmList(client.AllowedIdentityTokenSigningAlgorithms)
                .Concat(GetJwkSecretAlgorithms(client))
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
                ["clientName"] = GetDisplayName(client.ClientName, client.ClientId)
            };

            issues.Add(new ConfigurationIssueView
            {
                ResourceId = client.Id,
                ResourceName = client.ClientName ?? client.ClientId,
                Message = FormatMessage(messageTemplate, parameters),
                FixDescription = FormatMessage(fixDescriptionTemplate, parameters),
                IssueType = issueType,
                ResourceType = ConfigurationResourceType.Client,
                MessageParameters = parameters
            });
        }

        return issues;
    }

    /// <summary>
    /// A JWK secret carries its algorithm in the "alg" member. Secrets that are not
    /// JWKs, or JWKs without an "alg", say nothing about the signing algorithm.
    /// </summary>
    private static IEnumerable<string> GetJwkSecretAlgorithms(Client client)
    {
        if (client.ClientSecrets == null)
        {
            yield break;
        }

        foreach (var secret in client.ClientSecrets)
        {
            if (!string.Equals(secret.Type, JwkSecretType, StringComparison.OrdinalIgnoreCase)
                || string.IsNullOrWhiteSpace(secret.Value))
            {
                continue;
            }

            var algorithm = TryReadAlgorithm(secret.Value);

            if (!string.IsNullOrWhiteSpace(algorithm))
            {
                yield return algorithm;
            }
        }
    }

    private static string TryReadAlgorithm(string jwk)
    {
        try
        {
            using var document = JsonDocument.Parse(jwk);

            return document.RootElement.ValueKind == JsonValueKind.Object
                   && document.RootElement.TryGetProperty("alg", out var algorithm)
                   && algorithm.ValueKind == JsonValueKind.String
                ? algorithm.GetString()
                : null;
        }
        catch (JsonException)
        {
            // A malformed secret is not this rule's concern.
            return null;
        }
    }
}
