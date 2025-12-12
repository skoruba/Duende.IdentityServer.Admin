using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;

public static class ConfigurationIssuesMapper
{
    public static ConfigurationIssueDto ToDto(this ConfigurationIssueView issueView)
    {
        return new ConfigurationIssueDto
        {
            ResourceType = issueView.ResourceType,
            ResourceId = issueView.ResourceId,
            IssueType = issueView.IssueType,
            Message = issueView.Message,
            ResourceName = issueView.ResourceName,
            FixDescription = issueView.FixDescription
        };
    }

    public static ConfigurationIssueDto Map(this ConfigurationIssueView issueView, ConfigurationResourceType resourceType)
    {
        return new ConfigurationIssueDto
        {
            ResourceType = resourceType,
            ResourceId = issueView.ResourceId,
            IssueType = issueView.IssueType,
            Message = issueView.Message,
            ResourceName = issueView.ResourceName,
            FixDescription = issueView.FixDescription
        };
    }
}