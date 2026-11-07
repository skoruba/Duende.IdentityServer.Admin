// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.ComponentModel.DataAnnotations;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

public class ConfigurationRuleDto
{
    public int Id { get; set; }
    /// <summary>
    /// Key of the rule, e.g. <c>MissingPkce</c> or <c>Contoso.ClientSecretMustExpireWithinOneYear</c>;
    /// one of the keys <c>GET /api/ConfigurationRules/metadata</c> lists.
    /// </summary>
    [Required]
    [MaxLength(ConfigurationRuleKeys.MaxLength)]
    public string RuleType { get; set; }
    [Required]
    public ConfigurationResourceType ResourceType { get; set; }
    [Required]
    public ConfigurationIssueType IssueType { get; set; }
    public bool IsEnabled { get; set; }
    public string Configuration { get; set; }
    [Required]
    [MaxLength(500)]
    public string MessageTemplate { get; set; }
    [MaxLength(1000)]
    public string FixDescription { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
