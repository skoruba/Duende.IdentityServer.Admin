// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

public class ConfigurationIssueDto
{
    public int ResourceId { get; set; }
    public string ResourceName { get; set; }
    public ConfigurationIssueMessageEnum Message { get; set; }
    public ConfigurationIssueTypeView IssueType { get; set; }
    public ConfigurationResourceType ResourceType { get; set; }
}
