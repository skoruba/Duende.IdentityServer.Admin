using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;

public static class ConfigurationIssuesMapper
{
    public static ConfigurationIssueDto Map(this ConfigurationIssueView issueView, ConfigurationResourceType resourceType)
    {
        return new ConfigurationIssueDto
        {
            ResourceType = resourceType,
            ResourceId = issueView.ResourceId,
            IssueType = issueView.IssueType,
            Message = issueView.Message,
            ResourceName = issueView.ResourceName,
        };
    }
}