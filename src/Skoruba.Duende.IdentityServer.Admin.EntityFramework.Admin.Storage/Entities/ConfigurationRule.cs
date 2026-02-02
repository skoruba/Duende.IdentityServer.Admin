// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

public class ConfigurationRule
{
    public int Id { get; set; }

    /// <summary>
    /// Type of the rule (e.g., ObsoleteImplicitGrant, MissingPkce, etc.)
    /// </summary>
    public ConfigurationRuleType RuleType { get; set; }

    /// <summary>
    /// Which resource type this rule applies to
    /// </summary>
    public ConfigurationResourceType ResourceType { get; set; }

    /// <summary>
    /// Severity of the issue found by this rule
    /// </summary>
    public ConfigurationIssueType IssueType { get; set; }

    /// <summary>
    /// Whether this rule is active and should be checked
    /// </summary>
    public bool IsEnabled { get; set; }

    /// <summary>
    /// JSON configuration for rules that need additional parameters
    /// Example: {"prefix": "scope_"} or {"requireHttps": true}
    /// </summary>
    public string Configuration { get; set; }

    /// <summary>
    /// Custom message template that can use placeholders
    /// </summary>
    public string MessageTemplate { get; set; }

    /// <summary>
    /// Description of how to fix the issue - shown in UI as guidance
    /// Example: "Go to the client details → Advanced → Grant Types and replace 'implicit' with 'authorization_code'."
    /// </summary>
    public string FixDescription { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
