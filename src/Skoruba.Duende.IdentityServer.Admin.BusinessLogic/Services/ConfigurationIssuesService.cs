// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services;

public class ConfigurationIssuesService(IConfigurationIssuesRepository repository) : IConfigurationIssuesService
{
    public async Task<List<ConfigurationIssueDto>> GetAllIssuesAsync()
    {
        var configurationIssues = new List<ConfigurationIssueDto>();
        
        var clientIssues = await repository.GetClientIssuesAsync();
        var clientConfigurationIssues = clientIssues.Select(x => x.Map(ConfigurationResourceType.Client)).ToList();
        
        configurationIssues.AddRange(clientConfigurationIssues);
        
        return configurationIssues;
    }
}
