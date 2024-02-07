// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Helpers.DependencyInjection;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Configuration.Test
{
	public class StartupTest : Startup
    {
        public StartupTest(IWebHostEnvironment env, IConfiguration configuration) : base(env, configuration)
        {
        }

        public override void ConfigureUIOptions(IdentityServerAdminUIOptions options)
        {
            base.ConfigureUIOptions(options);

            // Use staging DbContexts and auth services.
            options.Testing.IsStaging = true;
        }
    }
}








