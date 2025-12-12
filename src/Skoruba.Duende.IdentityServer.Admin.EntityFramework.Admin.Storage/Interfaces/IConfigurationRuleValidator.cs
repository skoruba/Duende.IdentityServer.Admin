// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;

public interface IConfigurationRuleValidator
{
    Task<List<ConfigurationIssueView>> ValidateAsync(string configuration, string messageTemplate, ConfigurationIssueTypeView issueType);
}
