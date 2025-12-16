// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

#nullable enable

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;

public class ConfigurationIssuesPagedDto
{
    /// <summary>
    /// List of configuration issues
    /// </summary>
    public List<ConfigurationIssueDto> Issues { get; set; } = new();

    /// <summary>
    /// Total count of issues matching the filter criteria
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Current page index (0-based)
    /// </summary>
    public int PageIndex { get; set; }

    /// <summary>
    /// Page size used for this response
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages { get; set; }

    /// <summary>
    /// Whether there is a next page
    /// </summary>
    public bool HasNextPage { get; set; }

    /// <summary>
    /// Whether there is a previous page
    /// </summary>
    public bool HasPreviousPage { get; set; }
}