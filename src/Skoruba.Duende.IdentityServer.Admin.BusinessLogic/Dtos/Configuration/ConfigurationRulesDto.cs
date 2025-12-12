// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

public class ConfigurationRulesDto
{
    public ConfigurationRulesDto()
    {
        Rules = new List<ConfigurationRuleDto>();
    }

    public List<ConfigurationRuleDto> Rules { get; set; }
    public int TotalCount { get; set; }
    public int PageSize { get; set; }
}
