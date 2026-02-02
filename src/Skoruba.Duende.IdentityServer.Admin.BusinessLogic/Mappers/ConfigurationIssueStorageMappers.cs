// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Dtos;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;

public static class ConfigurationIssueMappers
{
    public static BusinessLogic.Dtos.Configuration.ConfigurationIssueDto ToBusinessDto(this Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Dtos.ConfigurationIssueDto storageDto)
    {
        return new BusinessLogic.Dtos.Configuration.ConfigurationIssueDto
        {
            ResourceType = storageDto.ResourceType,
            ResourceName = storageDto.ResourceName,
            ResourceId = storageDto.ResourceId,
            Message = storageDto.Message,
            FixDescription = storageDto.FixDescription,
            IssueType = storageDto.IssueType,
            MessageParameters = new System.Collections.Generic.Dictionary<string, string>()
        };
    }

    public static BusinessLogic.Dtos.Configuration.ConfigurationIssuesPagedDto ToBusinessDto(this Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Dtos.ConfigurationIssuesPagedDto storageDto)
    {
        return new BusinessLogic.Dtos.Configuration.ConfigurationIssuesPagedDto
        {
            Issues = storageDto.Issues.Select(x => x.ToBusinessDto()).ToList(),
            TotalCount = storageDto.TotalCount,
            PageIndex = storageDto.PageIndex,
            PageSize = storageDto.PageSize,
            TotalPages = storageDto.TotalPages,
            HasNextPage = storageDto.HasNextPage,
            HasPreviousPage = storageDto.HasPreviousPage
        };
    }

    public static Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Dtos.ConfigurationIssuesFilterDto ToStorageDto(this BusinessLogic.Dtos.Configuration.ConfigurationIssuesFilterDto businessDto)
    {
        return new Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Dtos.ConfigurationIssuesFilterDto
        {
            SearchTerm = businessDto.SearchTerm,
            ResourceType = businessDto.ResourceType,
            IssueType = businessDto.IssueType,
            PageIndex = businessDto.PageIndex,
            PageSize = businessDto.PageSize,
            SkipPagination = businessDto.SkipPagination
        };
    }
}