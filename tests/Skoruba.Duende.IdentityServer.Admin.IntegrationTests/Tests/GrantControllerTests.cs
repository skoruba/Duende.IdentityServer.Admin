﻿// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.IntegrationTests.Common;
using Skoruba.Duende.IdentityServer.Admin.UI.Configuration.Constants;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.IntegrationTests.Tests
{
	public class GrantControllerTests: IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient Client;
        public GrantControllerTests(CustomWebApplicationFactory factory)
        {
            Client = factory.Create();
        }

        [Fact]
        public async Task ReturnSuccessWithAdminRole()
        {
            foreach (var route in RoutesConstants.GetGrantRoutes())
            {
                // Act
                var response = await Client.GetAsync($"/Grant/{route}");

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

            foreach (var route in RoutesConstants.GetGrantRoutes())
            {
                // Act
                var response = await client.GetAsync($"/Grant/{route}");
                
                // Assert           
                response.StatusCode.Should().Be(HttpStatusCode.Redirect);

                //The redirect to login
                response.Headers.Location.ToString().Should().Contain(AuthenticationConsts.AccountLoginPage);
            }
        }
    }
}
