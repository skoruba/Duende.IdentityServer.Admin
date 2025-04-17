namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;

public class ConfigurationIssueView
{
    public int ResourceId { get; set; }
    public string ResourceName { get; set; }
    public ConfigurationIssueMessageEnum Message { get; set; }
    public ConfigurationIssueTypeView IssueType { get; set; }
}