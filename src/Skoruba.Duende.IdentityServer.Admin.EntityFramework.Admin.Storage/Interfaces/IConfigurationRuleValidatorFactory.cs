// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

public interface IConfigurationRuleValidatorFactory
{
    IConfigurationRuleValidator Create(ConfigurationRuleType ruleType);
}
