// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.IdentityResourceRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

public class ConfigurationRuleValidatorFactory : IConfigurationRuleValidatorFactory
{
    public IConfigurationRuleValidator Create(ConfigurationRuleType ruleType)
    {
        return ruleType switch
        {
            ConfigurationRuleType.ObsoleteImplicitGrant => new ObsoleteImplicitGrantRule(),
            ConfigurationRuleType.ObsoletePasswordGrant => new ObsoletePasswordGrantRule(),
            ConfigurationRuleType.MissingPkce => new MissingPkceRule(),
            ConfigurationRuleType.ClientRedirectUrisMustUseHttps => new ClientRedirectUrisMustUseHttpsRule(),
            ConfigurationRuleType.ClientAccessTokenLifetimeTooLong => new ClientAccessTokenLifetimeTooLongRule(),
            ConfigurationRuleType.ClientMustHaveScopes => new ClientMustHaveScopesRule(),
            ConfigurationRuleType.ClientRefreshTokenLifetimeTooLong => new ClientRefreshTokenLifetimeTooLongRule(),
            ConfigurationRuleType.ApiScopeNameMustStartWith => new ApiScopeNameMustStartWithRule(),
            ConfigurationRuleType.ApiScopeNameMustNotContain => new ApiScopeNameMustNotContainRule(),
            ConfigurationRuleType.ApiScopeMustHaveDisplayName => new ApiScopeMustHaveDisplayNameRule(),
            ConfigurationRuleType.ApiResourceMustHaveScopes => new ApiResourceMustHaveScopesRule(),
            ConfigurationRuleType.ApiResourceNameMustStartWith => new ApiResourceNameMustStartWithRule(),
            ConfigurationRuleType.IdentityResourceMustBeEnabled => new IdentityResourceMustBeEnabledRule(),
            ConfigurationRuleType.IdentityResourceNameMustStartWith => new IdentityResourceNameMustStartWithRule(),
            ConfigurationRuleType.ScopeIsUnused => new ScopeIsUnusedRule(),
            ConfigurationRuleType.SecretIsExpiredInDays => new SecretIsExpiredInDaysRule(),
            _ => throw new NotSupportedException($"Rule type {ruleType} is not implemented yet")
        };
    }
}
