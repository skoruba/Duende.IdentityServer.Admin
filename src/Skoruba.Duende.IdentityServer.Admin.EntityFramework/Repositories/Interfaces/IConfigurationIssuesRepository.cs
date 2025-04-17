// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

public interface IConfigurationIssuesRepository
{
    Task<List<ConfigurationIssueView>> GetClientIssuesAsync();
    Task<List<ConfigurationIssueView>> GetApiResourceIssuesAsync();
    Task<List<ConfigurationIssueView>> GetIdentityResourceIssuesAsync();
    Task<List<ConfigurationIssueView>> GetApiScopeIssuesAsync();
}