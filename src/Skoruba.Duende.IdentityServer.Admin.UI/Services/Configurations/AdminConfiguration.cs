namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;

public class AdminConfiguration
{
    public required AdminBasicConfiguration BasicConfiguration { get; set; }
    public required AdminAuthenticationConfiguration AuthenticationConfiguration { get; set; }
    public required AdminApiConfiguration ApiConfiguration { get; set; }
}