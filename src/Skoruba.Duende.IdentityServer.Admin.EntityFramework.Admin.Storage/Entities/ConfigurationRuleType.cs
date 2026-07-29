// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

public enum ConfigurationRuleType
{
    // Client rules
    ObsoleteImplicitGrant,
    ObsoletePasswordGrant,
    MissingPkce,
    ClientRedirectUrisMustUseHttps,
    ClientMustHaveScopes,
    ClientAccessTokenLifetimeTooLong,
    ClientRefreshTokenLifetimeTooLong,

    // API Scope rules
    ApiScopeNameMustStartWith,
    ApiScopeNameMustNotContain,
    ApiScopeMustHaveDisplayName,

    // API Resource rules
    ApiResourceMustHaveScopes,
    ApiResourceNameMustStartWith,

    // Identity Resource rules
    IdentityResourceMustBeEnabled,
    IdentityResourceNameMustStartWith,

    // Security rules
    ScopeIsUnused,
    SecretIsExpiredInDays,

    // Client naming rules - appended at the end, the values are persisted as int
    ClientNameMustStartWith,
    ClientNameMustNotContain,
    ClientIdMustStartWith,
    ClientIdMustNotContain,
    ClientScopeMustExist
}
