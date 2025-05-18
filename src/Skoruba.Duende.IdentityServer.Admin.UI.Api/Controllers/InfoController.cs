// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.ExceptionHandling;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [TypeFilter(typeof(ControllerExceptionFilterAttribute))]
    [Produces("application/json")]
    [Authorize(Policy = AuthorizationConsts.AdministrationPolicy)]
    public class InfoController(AdminApiConfiguration adminApiConfiguration) : ControllerBase
    {

        [HttpGet(nameof(GetApplicationVersion))]
        public ActionResult<string> GetApplicationVersion()
        {
            return typeof(StartupHelpers).GetInformationalVersion();
        }
        
        [HttpGet(nameof(GetApplicationName))]
        public ActionResult<string> GetApplicationName()
        {
            if (adminApiConfiguration == null)
            {
                return NotFound();
            }
            
            return adminApiConfiguration.ApplicationName;
        }
    }
}