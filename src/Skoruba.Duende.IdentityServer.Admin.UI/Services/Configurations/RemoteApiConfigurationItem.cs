namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;

public class RemoteApiConfigurationItem
{
    public required string ApiName { get; set; }

    public required string RemoteUrl { get; set; }

    public bool UseCsrfProtection { get; set; } = true;
}