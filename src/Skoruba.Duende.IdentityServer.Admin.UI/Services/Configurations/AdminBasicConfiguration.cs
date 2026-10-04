namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;

public class AdminBasicConfiguration
{
    public string Title { get; set; } = "Skoruba IdentityServer Admin UI";

    public string BasePath { get; set; } = "/";

    /// <summary>
    /// Shows the user and role management (ASP.NET Core Identity) in the Admin UI. With <c>false</c> the SPA
    /// hides the Identity Management menu, the dashboard card, the quick actions and the user search, and its
    /// user and role pages lead to the dashboard. The Admin API is not affected.
    /// </summary>
    public bool IdentityManagementEnabled { get; set; } = true;
}
