using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.UI.Services;
using Skoruba.Duende.IdentityServer.Admin.UI.Services.AntiForgeryProtection;
using Skoruba.Duende.IdentityServer.Admin.UI.Services.User;

namespace Skoruba.Duende.IdentityServer.Admin.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [AntiForgeryProtection]
    public ActionResult<UserClaimsDto> Get()
    {
        if (User.Identity is { IsAuthenticated: false })
        {
            return Ok(new UserClaimsDto
            {
                IsAuthenticated = false,
            });
        }

        return Ok(new UserClaimsDto
        {
            IsAuthenticated = true,
            UserId = User.GetUserId()!,
            UserName = User.GetUserName()!, 
            Email = User.GetUserEmail()!
        });
    }
}