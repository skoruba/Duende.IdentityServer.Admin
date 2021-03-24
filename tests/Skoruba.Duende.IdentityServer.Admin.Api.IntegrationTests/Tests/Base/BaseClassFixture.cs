// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Net.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.Api.Configuration.Test;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Common;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base
{
    public class BaseClassFixture : IClassFixture<WebApplicationFactory<StartupTest>>
    {
        protected readonly WebApplicationFactory<StartupTest> Factory;
        protected readonly HttpClient Client;

        public BaseClassFixture(WebApplicationFactory<StartupTest> factory)
        {
            Factory = factory;
            Client = factory.SetupClient();
            Factory.CreateClient();
        }

        protected virtual void SetupAdminClaimsViaHeaders()
        {
            using (var scope = Factory.Services.CreateScope())
            {
                var configuration = scope.ServiceProvider.GetRequiredService<AdminApiConfiguration>();
                Client.SetAdminClaimsViaHeaders(configuration);
            }
        }
    }
}