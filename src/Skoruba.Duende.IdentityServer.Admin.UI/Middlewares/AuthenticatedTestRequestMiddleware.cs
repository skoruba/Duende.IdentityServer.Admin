// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.UI.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Middlewares
{
    public class AuthenticatedTestRequestMiddleware
    {
        private readonly RequestDelegate _next;
        public static readonly string TestAuthorizationHeader = "FakeAuthorization";
        public static readonly string AddCustomeOverrideEnabled = "X-Test-Auth";
        private readonly AdminConfiguration _adminConfiguration;
        public AuthenticatedTestRequestMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _adminConfiguration = configuration.GetSection(nameof(AdminConfiguration)).Get<AdminConfiguration>();
        }

        public async Task Invoke(HttpContext context)
        {
            bool isFakeAuthDisabled()
            {
                return context.Request.Headers.TryGetValue(AddCustomeOverrideEnabled, out var authHeader) && !bool.Parse(authHeader);
            }
            
            var claims = new[]
            {
                new Claim("sub", Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, _adminConfiguration.AdministrationRole),
            };
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);            
            
            if (!isFakeAuthDisabled())
            {
                context.User = new ClaimsPrincipal(claimsIdentity);
            }       
            await _next(context);
        }
    }
}
