namespace Skoruba.Duende.IdentityServer.Admin.UI.Services.AntiForgeryProtection;

public class AntiForgeryProtectionToken(string token, string fieldName)
{

    public string Token { get; set; } = token;

    public string FieldName { get; set; } = fieldName;
}