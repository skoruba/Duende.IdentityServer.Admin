﻿// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.IntegrationTests.Common;
using Skoruba.Duende.IdentityServer.Admin.UI.Configuration.Constants;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.IntegrationTests.Tests
{
	public class ConfigurationControllerTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient Client;
        public ConfigurationControllerTests(CustomWebApplicationFactory factory) 
        {
            Client = factory.Create();
        }

        [Fact]
        public async Task ReturnSuccessWithAdminRole()
        {
            foreach (var route in RoutesConstants.GetConfigureRoutes())
            {
                // Act
                var response = await Client.GetAsync($"/Configuration/{route}");

                // Assert
                response.EnsureSuccessStatusCode();
                response.StatusCode.Should().Be(HttpStatusCode.OK);
            }
        }


        [Fact]
        public async Task ReturnRedirectWithoutAdminRole()
        {
            //Remove
            var client = Client.NoAuthClient();
            
            foreach (var route in RoutesConstants.GetConfigureRoutes())
            {
                // Act
                var response = await client.GetAsync($"/Configuration/{route}");

                // Assert           
                response.StatusCode.Should().Be(HttpStatusCode.Redirect);

                //The redirect to login
                response.Headers.Location.ToString().Should().Contain(AuthenticationConsts.AccountLoginPage);
            }
        }
    }
}
