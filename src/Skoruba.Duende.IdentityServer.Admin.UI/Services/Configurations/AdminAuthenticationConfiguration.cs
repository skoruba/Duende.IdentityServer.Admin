namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;

public class AdminAuthenticationConfiguration
{
    public required string Authority { get; set; }

    public required string ClientId { get; set; }

    public required string ClientSecret { get; set; }
    
    public required List<string> AdminScopes { get; set; } = new();
}