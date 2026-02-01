namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;

public class RemoteApiConfigurationItem
{
    public string ApiName { get; set; } = string.Empty;

    public string RemoteUrl { get; set; } = string.Empty;

    public bool UseCsrfProtection { get; set; } = true;
}
