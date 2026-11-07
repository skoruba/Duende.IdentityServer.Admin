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

    /// <summary>
    /// Shows Monitoring → Error Logs, the log events the STS writes into the Log table. With <c>false</c> the SPA
    /// hides the menu entry and the command palette item, and the page leads to the dashboard. Turn it off together
    /// with DatabaseLogConfiguration:Enabled of the STS. The Admin API is not affected.
    /// </summary>
    public bool ErrorLogsEnabled { get; set; } = true;
}
