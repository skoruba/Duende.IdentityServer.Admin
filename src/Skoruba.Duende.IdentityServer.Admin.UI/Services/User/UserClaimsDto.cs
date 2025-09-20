namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.User;

public class UserClaimsDto
{
    public bool IsAuthenticated { get; set; }

    public string? UserName { get; set; }

    public string? Email { get; set; }

    public string? UserId { get; set; }
}