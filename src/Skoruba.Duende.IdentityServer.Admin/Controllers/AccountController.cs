using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Skoruba.Duende.IdentityServer.Admin.Controllers;

[Authorize]
public class AccountController(IAntiforgery antiforgery, IOptions<AuthenticationOptions> authOptions)
    : Controller
{
    [HttpGet]
    [AllowAnonymous]
    public IActionResult Login(string? returnUrl = "/")
    {
        if (!Url.IsLocalUrl(returnUrl))
        {
            returnUrl = "/";
        }

        var authenticationProperties = new AuthenticationProperties
        {
            RedirectUri = returnUrl
        };
        
        var oidcScheme = authOptions.Value.DefaultChallengeScheme
                         ?? OpenIdConnectDefaults.AuthenticationScheme;

        return Challenge(authenticationProperties, oidcScheme);
    }
    
    [HttpPost]
    public async Task<IActionResult> Logout([FromForm] string? returnUrl)
    {
        try
        {
            await antiforgery.ValidateRequestAsync(HttpContext);
        }
        catch (AntiforgeryValidationException ex)
        {
            return Problem(
                title: "Invalid CSRF token",
                detail: ex.Message,
                statusCode: StatusCodes.Status403Forbidden);
        }

        if (!Url.IsLocalUrl(returnUrl))
        {
            returnUrl = Url.Content("~/");
        }

        var cookieScheme = authOptions.Value.DefaultScheme
                           ?? CookieAuthenticationDefaults.AuthenticationScheme;

        var oidcScheme = authOptions.Value.DefaultSignOutScheme
                         ?? authOptions.Value.DefaultChallengeScheme
                         ?? OpenIdConnectDefaults.AuthenticationScheme;

        var props = new AuthenticationProperties { RedirectUri = returnUrl };

        return SignOut(props, cookieScheme, oidcScheme);
    }
}