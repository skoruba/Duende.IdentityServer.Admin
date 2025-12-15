using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

public class ConfigurationIssueView
{
    public int ResourceId { get; set; }
    public string ResourceName { get; set; }
    public string Message { get; set; }
    public ConfigurationIssueTypeView IssueType { get; set; }
    public ConfigurationResourceType ResourceType { get; set; }
    public string FixDescription { get; set; }

    /// <summary>
    /// Parameters for message template placeholders
    /// Example: {"maxLifetime": "300", "actualLifetime": "3600"}
    /// </summary>
    public Dictionary<string, string> MessageParameters { get; set; }
}