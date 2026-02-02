namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;

public class AdminConfiguration
{
    public AdminBasicConfiguration BasicConfiguration { get; set; } = new();
    public AdminAuthenticationConfiguration AuthenticationConfiguration { get; set; } = new();
    public AdminApiConfiguration ApiConfiguration { get; set; } = new();
}
