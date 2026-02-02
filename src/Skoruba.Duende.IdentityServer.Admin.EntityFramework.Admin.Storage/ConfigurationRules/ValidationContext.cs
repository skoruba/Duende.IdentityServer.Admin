// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using Duende.IdentityServer.EntityFramework.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

/// <summary>
/// Contains all pre-loaded data needed by validators to avoid N+1 queries
/// </summary>
public class ValidationContext
{
    public List<Client> Clients { get; set; } = new();
    public List<ApiScope> ApiScopes { get; set; } = new();
    public List<ApiResource> ApiResources { get; set; } = new();
    public List<IdentityResource> IdentityResources { get; set; } = new();
}
