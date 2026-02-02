// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;

public interface IConfigurationRulesService
{
    Task<ConfigurationRulesDto> GetAllRulesAsync();
    Task<ConfigurationRuleDto> GetRuleByIdAsync(int id);
    Task<int> AddRuleAsync(ConfigurationRuleDto rule);
    Task<int> UpdateRuleAsync(ConfigurationRuleDto rule);
    Task<int> DeleteRuleAsync(int id);
    Task<bool> ToggleRuleAsync(int id);
}
