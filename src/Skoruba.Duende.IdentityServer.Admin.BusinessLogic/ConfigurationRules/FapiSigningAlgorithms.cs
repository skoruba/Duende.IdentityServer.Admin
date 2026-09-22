// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

/// <summary>
/// Shared pieces of the FAPI 2.0 signing algorithm rules.
///
/// Section 5.4 of the FAPI 2.0 Security Profile is a closed enumeration - PS256, ES256
/// and EdDSA (Ed25519). Anything else, including the longer ES384/ES512 and PS384/PS512
/// variants, is non-conformant. EdDSA is left out of the default configuration because
/// Microsoft.IdentityModel cannot validate it without a third party provider.
///
/// Algorithm names are compared case-sensitively: JWA "alg" values are case-sensitive
/// identifiers, and IdentityServer rejects variants such as "ps256".
/// </summary>
internal static class FapiSigningAlgorithms
{
    public static readonly StringComparer Comparer = StringComparer.Ordinal;

    public static HashSet<string> ReadAllowedAlgorithms(FapiSigningAlgorithmsConfig config)
        => new(config.AllowedAlgorithms ?? new List<string>(), Comparer);

    /// <summary>
    /// The allowed signing algorithms of a client or an API resource are persisted as a
    /// single comma separated column.
    /// </summary>
    public static IEnumerable<string> ParseAlgorithmList(string commaSeparatedAlgorithms)
    {
        if (string.IsNullOrWhiteSpace(commaSeparatedAlgorithms))
        {
            return Enumerable.Empty<string>();
        }

        return commaSeparatedAlgorithms
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(algorithm => algorithm.Trim())
            .Where(algorithm => algorithm.Length > 0);
    }
}

internal class FapiSigningAlgorithmsConfig
{
    public List<string> AllowedAlgorithms { get; set; } = new() { "PS256", "ES256" };
}
