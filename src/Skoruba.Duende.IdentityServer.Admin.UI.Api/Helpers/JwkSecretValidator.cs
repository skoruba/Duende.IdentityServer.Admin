// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Helpers
{
    /// <summary>
    /// A JWK secret holds the public key only. The Admin UI checks that before it sends the value,
    /// but the API is the boundary that has to hold for every caller.
    /// </summary>
    public static class JwkSecretValidator
    {
        public const string JwkSecretType = "JWK";

        private const string SymmetricKeyType = "oct";

        private static readonly string[] PrivateMembers = { "d", "p", "q", "dp", "dq", "qi", "oth", "k" };

        public static IEnumerable<ValidationResult> Validate(string secretType, string value, string memberName)
        {
            // The type is matched regardless of casing - a "jwk" secret must not slip past the checks below
            if (!string.Equals(secretType, JwkSecretType, StringComparison.OrdinalIgnoreCase) || string.IsNullOrWhiteSpace(value))
            {
                yield break;
            }

            var error = GetError(value);
            if (error != null)
            {
                yield return new ValidationResult(error, new[] { memberName });
            }
        }

        private static string GetError(string value)
        {
            JsonDocument document;
            try
            {
                document = JsonDocument.Parse(value);
            }
            catch (JsonException)
            {
                return "The JWK secret value is not valid JSON.";
            }

            using (document)
            {
                var root = document.RootElement;
                if (root.ValueKind != JsonValueKind.Object)
                {
                    return "The JWK secret value must be a single JSON Web Key object.";
                }

                // The whole structure is walked - private members must not survive anywhere in it
                var privateMember = FindPrivateMember(root);
                if (privateMember != null)
                {
                    return $"The JWK secret value contains the private key member '{privateMember}'. Register the public key only.";
                }

                // A secret is one key - IdentityServer parses the value as a single JsonWebKey, so a set would never match
                if (root.TryGetProperty("keys", out _))
                {
                    return "A JWK Set is not supported as a JWK secret. Register a single JSON Web Key.";
                }

                if (!root.TryGetProperty("kty", out var keyType) || keyType.ValueKind != JsonValueKind.String ||
                    string.IsNullOrWhiteSpace(keyType.GetString()))
                {
                    return "The JWK secret value must state its key type in the 'kty' member.";
                }

                if (string.Equals(keyType.GetString(), SymmetricKeyType, StringComparison.OrdinalIgnoreCase))
                {
                    return "Symmetric keys are not supported as a JWK secret.";
                }
            }

            return null;
        }

        private static string FindPrivateMember(JsonElement element)
        {
            switch (element.ValueKind)
            {
                case JsonValueKind.Array:
                    return element.EnumerateArray().Select(FindPrivateMember).FirstOrDefault(found => found != null);
                case JsonValueKind.Object:
                    foreach (var property in element.EnumerateObject())
                    {
                        // JsonWebKey reads member names regardless of casing, so "D" is as private as "d"
                        if (PrivateMembers.Contains(property.Name, StringComparer.OrdinalIgnoreCase))
                        {
                            return property.Name;
                        }

                        var nested = FindPrivateMember(property.Value);
                        if (nested != null)
                        {
                            return nested;
                        }
                    }

                    return null;
                default:
                    return null;
            }
        }
    }
}
