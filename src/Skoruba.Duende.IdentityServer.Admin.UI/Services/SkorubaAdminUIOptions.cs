using Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Services;

public class SkorubaAdminUIOptions
{
    public AdminConfiguration AdminConfiguration { get; set; } = new();
}
