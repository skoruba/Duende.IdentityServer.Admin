// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.IdentityResourceRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

public class ConfigurationRuleValidatorFactory<TDbContext> : IConfigurationRuleValidatorFactory
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ConfigurationRuleValidatorFactory(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IConfigurationRuleValidator Create(ConfigurationRuleType ruleType)
    {
        return ruleType switch
        {
            ConfigurationRuleType.ObsoleteImplicitGrant => new ObsoleteImplicitGrantRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ObsoletePasswordGrant => new ObsoletePasswordGrantRule<TDbContext>(_dbContext),
            ConfigurationRuleType.MissingPkce => new MissingPkceRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ClientRedirectUrisMustUseHttps => new ClientRedirectUrisMustUseHttpsRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ClientAccessTokenLifetimeTooLong => new ClientAccessTokenLifetimeTooLongRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ClientMustHaveScopes => new ClientMustHaveScopesRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ClientRefreshTokenLifetimeTooLong => new ClientRefreshTokenLifetimeTooLongRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ApiScopeNameMustStartWith => new ApiScopeNameMustStartWithRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ApiScopeNameMustNotContain => new ApiScopeNameMustNotContainRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ApiScopeMustHaveDisplayName => new ApiScopeMustHaveDisplayNameRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ApiResourceMustHaveScopes => new ApiResourceMustHaveScopesRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ApiResourceNameMustStartWith => new ApiResourceNameMustStartWithRule<TDbContext>(_dbContext),
            ConfigurationRuleType.IdentityResourceMustBeEnabled => new IdentityResourceMustBeEnabledRule<TDbContext>(_dbContext),
            ConfigurationRuleType.IdentityResourceNameMustStartWith => new IdentityResourceNameMustStartWithRule<TDbContext>(_dbContext),
            ConfigurationRuleType.ScopeIsUnused => new ScopeIsUnusedRule<TDbContext>(_dbContext),
            ConfigurationRuleType.SecretIsExpiredInDays => new SecretIsExpiredInDaysRule<TDbContext>(_dbContext),
            _ => throw new NotSupportedException($"Rule type {ruleType} is not implemented yet")
        };
    }
}
