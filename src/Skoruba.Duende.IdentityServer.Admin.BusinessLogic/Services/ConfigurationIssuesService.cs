// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services;

public class ConfigurationIssuesService(IConfigurationIssuesRepository repository) : IConfigurationIssuesService
{
    public async Task<List<ConfigurationIssueDto>> GetAllIssuesAsync()
    {
        var issues = await repository.GetAllIssuesAsync();
        return issues.Select(x => x.ToDto()).ToList();
    }

    public async Task<ConfigurationIssuesPagedDto> GetIssuesAsync(ConfigurationIssuesFilterDto filter)
    {
        var storageFilter = filter.ToStorageDto();
        var storageResult = await repository.GetIssuesAsync(storageFilter);
        return storageResult.ToBusinessDto();
    }
}
