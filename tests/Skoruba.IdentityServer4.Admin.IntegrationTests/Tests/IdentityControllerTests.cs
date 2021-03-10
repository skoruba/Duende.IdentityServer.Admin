using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Skoruba.Duende.IdentityServer.Admin.Configuration.Test;
using Skoruba.Duende.IdentityServer.Admin.IntegrationTests.Common;
using Skoruba.Duende.IdentityServer.Admin.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.UI.Configuration.Constants;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.IntegrationTests.Tests
{
	public class IdentityControllerTests : BaseClassFixture
    {
        public IdentityControllerTests(WebApplicationFactory<StartupTest> factory) : base(factory)
        {
        }

        [Fact]
        public async Task ReturnSuccessWithAdminRole()
        {
            SetupAdminClaimsViaHeaders();

            foreach (var route in RoutesConstants.GetIdentityRoutes())
            {
                // Act
                var response = await Client.GetAsync($"/Identity/{route}");

                // Assert
                response.EnsureSuccessStatusCode();
                response.StatusCode.Should().Be(HttpStatusCode.OK);
            }
        }

        [Fact]
        public async Task ReturnRedirectWithoutAdminRole()
        {
            //Remove
            Client.DefaultRequestHeaders.Clear();

            foreach (var route in RoutesConstants.GetIdentityRoutes())
            {
                // Act
                var response = await Client.GetAsync($"/Identity/{route}");

                // Assert           
                response.StatusCode.Should().Be(HttpStatusCode.Redirect);

                //The redirect to login
                response.Headers.Location.ToString().Should().Contain(AuthenticationConsts.AccountLoginPage);
            }
        }
    }
}
