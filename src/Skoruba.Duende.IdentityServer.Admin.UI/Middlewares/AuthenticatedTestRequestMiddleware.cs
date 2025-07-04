// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Middlewares
{
    public class AuthenticatedTestRequestMiddleware
    {
        private readonly RequestDelegate _next;
        public static readonly string TestAuthorizationHeader = "FakeAuthorization";
        public static readonly string AddCustomeOverrideEnabled = "X-Test-Auth";
        public AuthenticatedTestRequestMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            bool isFakeAuthDisabled()
            {
                return context.Request.Headers.TryGetValue(AddCustomeOverrideEnabled, out var authHeader) && !bool.Parse(authHeader);
            }
            
            var claims = new[]
            {
                new Claim(JwtClaimTypes.Subject, Guid.NewGuid().ToString()),
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
