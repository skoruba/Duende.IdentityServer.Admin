// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories.Interfaces;

public interface IConfigurationRulesRepository
{
    Task<List<ConfigurationRule>> GetAllRulesAsync();
    Task<ConfigurationRule> GetRuleByIdAsync(int id);
    Task<int> AddRuleAsync(ConfigurationRule rule);
    Task<int> UpdateRuleAsync(ConfigurationRule rule);
    Task<int> DeleteRuleAsync(int id);
    Task<bool> RuleExistsAsync(int id);
}
