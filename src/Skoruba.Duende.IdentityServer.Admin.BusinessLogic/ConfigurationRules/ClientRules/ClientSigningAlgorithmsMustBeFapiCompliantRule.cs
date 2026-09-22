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
                ResourceName = GetDisplayName(client.ClientName, client.ClientId),
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
    /// A JWK secret carries its algorithm in the "alg" member. Without it the curve of an
    /// EC or OKP key still fixes the algorithm; an RSA key can sign with any RSA algorithm,
    /// so it says nothing. Secrets that are not JWKs, and expired ones, are left out - an
    /// expired key can no longer authenticate the client.
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

            if (secret.Expiration.HasValue && secret.Expiration.Value <= DateTime.UtcNow)
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
            var root = document.RootElement;

            if (root.ValueKind != JsonValueKind.Object)
            {
                return null;
            }

            var algorithm = ReadString(root, "alg");

            return !string.IsNullOrWhiteSpace(algorithm)
                ? algorithm
                : GetAlgorithmOfCurve(ReadString(root, "kty"), ReadString(root, "crv"));
        }
        catch (JsonException)
        {
            // A malformed secret is not this rule's concern.
            return null;
        }
    }

    private static string ReadString(JsonElement jwk, string member)
    {
        return jwk.TryGetProperty(member, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
    }

    /// <summary>
    /// RFC 7518 and RFC 8037 bind each curve to a single signing algorithm.
    /// </summary>
    private static string GetAlgorithmOfCurve(string keyType, string curve)
    {
        return (keyType, curve) switch
        {
            ("EC", "P-256") => "ES256",
            ("EC", "P-384") => "ES384",
            ("EC", "P-521") => "ES512",
            ("EC", "secp256k1") => "ES256K",
            ("OKP", "Ed25519") => "EdDSA",
            ("OKP", "Ed448") => "EdDSA",
            _ => null
        };
    }
}
