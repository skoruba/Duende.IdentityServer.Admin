// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;

public interface IConfigurationIssuesService
{
    Task<List<ConfigurationIssueDto>> GetAllIssuesAsync();
}