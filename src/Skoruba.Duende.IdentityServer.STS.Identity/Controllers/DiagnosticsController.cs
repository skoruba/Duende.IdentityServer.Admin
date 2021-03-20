// Copyright (c) Duende Software. All rights reserved.
// See LICENSE in the project root for license information.

// Original file: https://github.com/DuendeSoftware/IdentityServer.Quickstart.UI
// Modified by Jan Škoruba

using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.STS.Identity.Helpers;
using Skoruba.Duende.IdentityServer.STS.Identity.ViewModels.Diagnostics;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Controllers
{
    [SecurityHeaders]
    [Authorize]
    public class DiagnosticsController : Controller
    {
        public async Task<IActionResult> Index()
        {
            var localAddresses = new string[] { "127.0.0.1", "::1", HttpContext.Connection?.LocalIpAddress?.ToString() };
            if (!localAddresses.Contains(HttpContext.Connection?.RemoteIpAddress?.ToString()))
            {
                return NotFound();
            }

            var model = new DiagnosticsViewModel(await HttpContext.AuthenticateAsync());
            return View(model);
        }
    }
}