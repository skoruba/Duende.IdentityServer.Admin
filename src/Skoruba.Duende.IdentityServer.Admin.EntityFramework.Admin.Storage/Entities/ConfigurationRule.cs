// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

public class ConfigurationRule
{
    public int Id { get; set; }

    /// <summary>
    /// Key of the rule that checks this row, e.g. <c>MissingPkce</c> for a built-in rule or
    /// <c>Contoso.ClientSecretMustExpireWithinOneYear</c> for a custom one.
    /// See <see cref="ConfigurationRules.ConfigurationRuleKeys"/>.
    /// </summary>
    public string RuleType { get; set; }

    /// <summary>
    /// Which resource type this rule applies to
    /// </summary>
    public ConfigurationResourceType ResourceType { get; set; }

    /// <summary>
    /// Severity of the issue found by this rule
    /// </summary>
    public ConfigurationIssueType IssueType { get; set; }

    /// <summary>
    /// Whether the rule is active
    /// </summary>
    public bool IsEnabled { get; set; }

    /// <summary>
    /// JSON configuration for the rule (optional)
    /// Example: {"maxLifetimeSeconds": 3600}
    /// </summary>
    public string Configuration { get; set; }

    /// <summary>
    /// Message template for the issue
    /// Example: "Token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s"
    /// </summary>
    public string MessageTemplate { get; set; }

    /// <summary>
    /// Description of how to fix the issue
    /// </summary>
    public string FixDescription { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
