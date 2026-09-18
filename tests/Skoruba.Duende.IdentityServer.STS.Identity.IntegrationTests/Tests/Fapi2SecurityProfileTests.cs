// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Duende.IdentityServer.Configuration;
using FluentAssertions;
using IdentityModel.Client;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Skoruba.Duende.IdentityServer.STS.Identity.Configuration;
using Skoruba.Duende.IdentityServer.STS.Identity.Configuration.Test;
using Xunit;

namespace Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Tests
{
    /// <summary>
    /// The profile is a configuration switch, so each test starts its own host -
    /// the shared fixture runs with the switch in its default, disabled position.
    /// </summary>
    public class Fapi2SecurityProfileTests
    {
        private static readonly string[] FapiAlgorithms = { "PS256", "ES256" };

        [Fact]
        public void EnabledProfileRestrictsSigningAlgorithmsAndClockSkew()
        {
            using var host = StartHost(isProfileEnabled: true);
            var options = host.Services.GetRequiredService<IdentityServerOptions>();

            options.KeyManagement.SigningAlgorithms.Select(algorithm => algorithm.Name)
                .Should().Equal("PS256");
            options.DPoP.SupportedDPoPSigningAlgorithms.Should().Equal(FapiAlgorithms);
            options.SupportedClientAssertionSigningAlgorithms.Should().Equal(FapiAlgorithms);
            options.SupportedRequestObjectSigningAlgorithms.Should().Equal(FapiAlgorithms);
            options.JwtValidationClockSkew.Should().Be(TimeSpan.FromSeconds(10));
        }

        [Fact]
        public void DisabledProfileLeavesIdentityServerDefaults()
        {
            using var host = StartHost(isProfileEnabled: false);
            var options = host.Services.GetRequiredService<IdentityServerOptions>();
            var defaults = new IdentityServerOptions();

            options.DPoP.SupportedDPoPSigningAlgorithms
                .Should().BeEquivalentTo(defaults.DPoP.SupportedDPoPSigningAlgorithms);
            options.SupportedClientAssertionSigningAlgorithms
                .Should().BeEquivalentTo(defaults.SupportedClientAssertionSigningAlgorithms);
            options.SupportedRequestObjectSigningAlgorithms
                .Should().BeEquivalentTo(defaults.SupportedRequestObjectSigningAlgorithms);
            options.JwtValidationClockSkew.Should().Be(defaults.JwtValidationClockSkew);

            // Guards the test itself - the defaults have to be wider than the profile.
            defaults.DPoP.SupportedDPoPSigningAlgorithms.Should().Contain("RS256");
        }

        [Fact]
        public async Task EnabledProfileIsAdvertisedInDiscoveryDocument()
        {
            using var host = StartHost(isProfileEnabled: true);
            using var client = host.GetTestClient();

            var disco = await client.GetDiscoveryDocumentAsync("http://localhost");

            disco.IsError.Should().Be(false);
            ReadStringArray(disco, "dpop_signing_alg_values_supported")
                .Should().Equal(FapiAlgorithms);
            ReadStringArray(disco, "token_endpoint_auth_signing_alg_values_supported")
                .Should().Equal(FapiAlgorithms);
            ReadStringArray(disco, "request_object_signing_alg_values_supported")
                .Should().Equal(FapiAlgorithms);
            ReadStringArray(disco, "id_token_signing_alg_values_supported")
                .Should().Equal("PS256");
            disco.KeySet.Keys.Select(key => key.Alg).Should().Equal("PS256");
        }

        private static IEnumerable<string> ReadStringArray(DiscoveryDocumentResponse disco, string name)
        {
            return disco.TryGetStringArray(name);
        }

        private static IHost StartHost(bool isProfileEnabled)
        {
            return new HostBuilder()
                .ConfigureAppConfiguration(configApp =>
                {
                    configApp.AddJsonFile("appsettings.json", optional: true, reloadOnChange: false);
                    configApp.AddInMemoryCollection(new Dictionary<string, string>
                    {
                        [$"{nameof(Fapi2SecurityProfile)}:{nameof(Fapi2SecurityProfile.Enabled)}"] =
                            isProfileEnabled.ToString()
                    });
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseTestServer();
                    webBuilder.UseStartup<StartupTest>();
                })
                .Start();
        }
    }
}
