// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

/// <summary>
/// Keys of the built-in configuration rules and the rules every key has to follow.
/// The key is what a stored <see cref="Entities.ConfigurationRule"/> uses to find its
/// <see cref="IConfigurationRule"/>, so it must never change once rules are stored under it.
/// A built-in key is a plain name; a custom key carries a namespace, e.g.
/// <c>Skoruba.ClientSecretMustExpireWithinOneYear</c>, so that it can never collide
/// with a rule added to this project later.
/// </summary>
public static class ConfigurationRuleKeys
{
    public const int MaxLength = 200;

    public const char NamespaceSeparator = '.';

    // Client rules
    public const string ObsoleteImplicitGrant = nameof(ObsoleteImplicitGrant);
    public const string ObsoletePasswordGrant = nameof(ObsoletePasswordGrant);
    public const string MissingPkce = nameof(MissingPkce);
    public const string ClientRedirectUrisMustUseHttps = nameof(ClientRedirectUrisMustUseHttps);
    public const string ClientMustHaveScopes = nameof(ClientMustHaveScopes);
    public const string ClientAccessTokenLifetimeTooLong = nameof(ClientAccessTokenLifetimeTooLong);
    public const string ClientRefreshTokenLifetimeTooLong = nameof(ClientRefreshTokenLifetimeTooLong);
    public const string ClientNameMustStartWith = nameof(ClientNameMustStartWith);
    public const string ClientNameMustNotContain = nameof(ClientNameMustNotContain);
    public const string ClientIdMustStartWith = nameof(ClientIdMustStartWith);
    public const string ClientIdMustNotContain = nameof(ClientIdMustNotContain);
    public const string ClientScopeMustExist = nameof(ClientScopeMustExist);
    public const string ClientSigningAlgorithmsMustBeFapiCompliant = nameof(ClientSigningAlgorithmsMustBeFapiCompliant);

    // API scope rules
    public const string ApiScopeNameMustStartWith = nameof(ApiScopeNameMustStartWith);
    public const string ApiScopeNameMustNotContain = nameof(ApiScopeNameMustNotContain);
    public const string ApiScopeMustHaveDisplayName = nameof(ApiScopeMustHaveDisplayName);

    // API resource rules
    public const string ApiResourceMustHaveScopes = nameof(ApiResourceMustHaveScopes);
    public const string ApiResourceNameMustStartWith = nameof(ApiResourceNameMustStartWith);
    public const string ApiResourceSigningAlgorithmsMustBeFapiCompliant = nameof(ApiResourceSigningAlgorithmsMustBeFapiCompliant);

    // Identity resource rules
    public const string IdentityResourceMustBeEnabled = nameof(IdentityResourceMustBeEnabled);
    public const string IdentityResourceNameMustStartWith = nameof(IdentityResourceNameMustStartWith);

    // Security rules
    public const string ScopeIsUnused = nameof(ScopeIsUnused);
    public const string SecretIsExpiredInDays = nameof(SecretIsExpiredInDays);

    /// <summary>
    /// Every built-in key, in the order the rules were introduced.
    /// </summary>
    public static IReadOnlyList<string> BuiltIn { get; } = new[]
    {
        ObsoleteImplicitGrant,
        ObsoletePasswordGrant,
        MissingPkce,
        ClientRedirectUrisMustUseHttps,
        ClientMustHaveScopes,
        ClientAccessTokenLifetimeTooLong,
        ClientRefreshTokenLifetimeTooLong,
        ApiScopeNameMustStartWith,
        ApiScopeNameMustNotContain,
        ApiScopeMustHaveDisplayName,
        ApiResourceMustHaveScopes,
        ApiResourceNameMustStartWith,
        IdentityResourceMustBeEnabled,
        IdentityResourceNameMustStartWith,
        ScopeIsUnused,
        SecretIsExpiredInDays,
        ClientNameMustStartWith,
        ClientNameMustNotContain,
        ClientIdMustStartWith,
        ClientIdMustNotContain,
        ClientScopeMustExist,
        ClientSigningAlgorithmsMustBeFapiCompliant,
        ApiResourceSigningAlgorithmsMustBeFapiCompliant
    };

    /// <summary>
    /// A custom key is namespaced: <c>Vendor.RuleName</c>. Built-in keys have no namespace.
    /// </summary>
    public static bool IsCustom(string key)
    {
        return !string.IsNullOrEmpty(key) && key.Contains(NamespaceSeparator);
    }

    /// <summary>
    /// Letters, digits, underscores and dots, up to <see cref="MaxLength"/> characters;
    /// the dots separate non-empty segments. Keys are compared case-sensitively.
    /// </summary>
    public static bool IsWellFormed(string key)
    {
        if (string.IsNullOrEmpty(key) || key.Length > MaxLength)
        {
            return false;
        }

        if (!key.All(c => char.IsAsciiLetterOrDigit(c) || c == '_' || c == NamespaceSeparator))
        {
            return false;
        }

        return key.Split(NamespaceSeparator).All(segment => segment.Length > 0);
    }

    /// <summary>
    /// Throws when the key cannot be stored or would be ambiguous between the built-in
    /// rules of this project and the custom rules of a deployment.
    /// </summary>
    public static void Validate(string key, bool isBuiltIn)
    {
        if (!IsWellFormed(key))
        {
            throw new ArgumentException(
                $"Configuration rule key '{key}' is not valid. Use letters, digits and underscores, separate the namespace with a dot and keep it within {MaxLength} characters.",
                nameof(key));
        }

        if (isBuiltIn && IsCustom(key))
        {
            throw new ArgumentException(
                $"Built-in configuration rule key '{key}' must not contain a namespace.", nameof(key));
        }

        if (!isBuiltIn && !IsCustom(key))
        {
            throw new ArgumentException(
                $"Custom configuration rule key '{key}' must be namespaced, e.g. 'Skoruba.{key}', so that it cannot collide with a built-in rule.",
                nameof(key));
        }
    }
}
