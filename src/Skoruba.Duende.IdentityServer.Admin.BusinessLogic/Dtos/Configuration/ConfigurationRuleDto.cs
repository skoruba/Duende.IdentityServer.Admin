// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

public class ConfigurationRuleDto
{
    public int Id { get; set; }
    public ConfigurationRuleType RuleType { get; set; }
    public ConfigurationResourceType ResourceType { get; set; }
    public ConfigurationIssueType IssueType { get; set; }
    public bool IsEnabled { get; set; }
    public string Configuration { get; set; }
    public string MessageTemplate { get; set; }
    public string FixDescription { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
