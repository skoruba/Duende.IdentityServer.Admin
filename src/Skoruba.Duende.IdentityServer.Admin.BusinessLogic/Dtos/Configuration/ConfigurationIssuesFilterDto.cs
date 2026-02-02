// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

#nullable enable

using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

public class ConfigurationIssuesFilterDto
{
    /// <summary>
    /// Search term for filtering by resource name or message
    /// </summary>
    public string? SearchTerm { get; set; }

    /// <summary>
    /// Filter by specific resource type
    /// </summary>
    public ConfigurationResourceType? ResourceType { get; set; }

    /// <summary>
    /// Filter by specific issue type (severity)
    /// </summary>
    public ConfigurationIssueTypeView? IssueType { get; set; }

    /// <summary>
    /// Page index for pagination (0-based)
    /// </summary>
    public int PageIndex { get; set; } = 0;

    /// <summary>
    /// Page size for pagination
    /// </summary>
    public int PageSize { get; set; } = 50;

    /// <summary>
    /// Skip pagination and return all results
    /// </summary>
    public bool SkipPagination { get; set; } = false;
}