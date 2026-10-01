namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.UiConfiguration;

/// <summary>
/// The part of the Admin UI host configuration the SPA needs at startup. It is served anonymously
/// at GET /configuration, so it must not carry anything secret.
/// </summary>
public class UiConfigurationDto
{
    public bool IdentityManagementEnabled { get; set; } = true;
}
