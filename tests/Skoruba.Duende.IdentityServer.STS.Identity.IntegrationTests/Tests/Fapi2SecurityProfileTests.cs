// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Duende.IdentityServer.Configuration;
using Duende.IdentityServer.EntityFramework.Entities;
using FluentAssertions;
using IdentityModel.Client;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
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
            options.StrictClientAssertionAudienceValidation.Should().BeTrue();
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
            options.StrictClientAssertionAudienceValidation
                .Should().Be(defaults.StrictClientAssertionAudienceValidation);
            options.KeyManagement.SigningAlgorithms.Select(algorithm => algorithm.Name)
                .Should().NotContain("PS256");

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

        /// <summary>
        /// With the automatic key management off the tokens are signed by the configured
        /// certificate - the profile has to pick the algorithm for that certificate as well.
        /// </summary>
        [Theory]
        [InlineData(true, "RSA", "PS256")]
        [InlineData(true, "P-256", "ES256")]
        [InlineData(false, "RSA", "RS256")]
        public async Task ConfiguredSigningCertificateFollowsTheProfile(bool isProfileEnabled, string keyKind, string expectedAlgorithm)
        {
            var pfxPath = CreateSigningCertificateFile(keyKind);
            try
            {
                using var host = StartHost(isProfileEnabled, SigningCertificateSettings(pfxPath));
                using var client = host.GetTestClient();

                var disco = await client.GetDiscoveryDocumentAsync("http://localhost");

                disco.IsError.Should().Be(false);
                ReadStringArray(disco, "id_token_signing_alg_values_supported")
                    .Should().Equal(expectedAlgorithm);
                disco.KeySet.Keys.Select(key => key.Alg).Should().Equal(expectedAlgorithm);
            }
            finally
            {
                File.Delete(pfxPath);
            }
        }

        /// <summary>
        /// ES256 is ECDSA over P-256 only. A certificate on another curve cannot sign a conformant
        /// token, so the host refuses to start instead of labelling a P-384 signature as ES256.
        /// </summary>
        [Theory]
        [InlineData("P-384")]
        [InlineData("P-521")]
        public void EnabledProfileRefusesAnEcCertificateOutsideP256(string curve)
        {
            var pfxPath = CreateSigningCertificateFile(curve);
            try
            {
                var startHost = () => StartHost(isProfileEnabled: true, SigningCertificateSettings(pfxPath)).Dispose();

                startHost.Should().Throw<Exception>()
                    .Where(exception => exception.ToString().Contains("P-256"));
            }
            finally
            {
                File.Delete(pfxPath);
            }
        }

        /// <summary>
        /// The metadata above only advertises the profile - this proves the token endpoint enforces it.
        /// The PS256 request guards the test itself, the RS256 one differs in the algorithm only.
        /// </summary>
        [Fact]
        public async Task EnabledProfileRejectsRs256ClientAssertion()
        {
            using var host = StartHost(isProfileEnabled: true);
            using var client = host.GetTestClient();
            using var clientKey = RSA.Create(2048);

            var clientId = $"fapi2-client-{Guid.NewGuid():N}";
            var scope = $"fapi2-scope-{Guid.NewGuid():N}";
            await SeedPrivateKeyJwtClientAsync(host, clientId, scope, clientKey);

            var disco = await client.GetDiscoveryDocumentAsync("http://localhost");
            disco.IsError.Should().Be(false);

            var accepted = await RequestTokenAsync(client, disco, clientId, scope, clientKey, SecurityAlgorithms.RsaSsaPssSha256);
            var rejected = await RequestTokenAsync(client, disco, clientId, scope, clientKey, SecurityAlgorithms.RsaSha256);

            accepted.IsError.Should().BeFalse(accepted.Error);
            rejected.IsError.Should().BeTrue();
            rejected.Error.Should().Be("invalid_client");
        }

        private const string PfxPassword = "fapi2-test";

        private static string CreateSigningCertificateFile(string keyKind)
        {
            using var rsa = RSA.Create(2048);
            using var ecdsa = ECDsa.Create(keyKind switch
            {
                "P-384" => ECCurve.NamedCurves.nistP384,
                "P-521" => ECCurve.NamedCurves.nistP521,
                _ => ECCurve.NamedCurves.nistP256
            });

            var request = keyKind == "RSA"
                ? new CertificateRequest("CN=fapi2-signing", rsa, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1)
                : new CertificateRequest("CN=fapi2-signing", ecdsa, HashAlgorithmName.SHA256);

            using var certificate = request.CreateSelfSigned(DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddDays(1));

            var path = Path.Combine(Path.GetTempPath(), $"fapi2-signing-{Guid.NewGuid():N}.pfx");
            File.WriteAllBytes(path, certificate.Export(X509ContentType.Pfx, PfxPassword));

            return path;
        }

        private static Dictionary<string, string> SigningCertificateSettings(string pfxPath) => new()
        {
            ["IdentityServerOptions:KeyManagement:Enabled"] = "false",
            ["CertificateConfiguration:UseTemporarySigningKeyForDevelopment"] = "false",
            ["CertificateConfiguration:UseSigningCertificatePfxFile"] = "true",
            ["CertificateConfiguration:SigningCertificatePfxFilePath"] = pfxPath,
            ["CertificateConfiguration:SigningCertificatePfxFilePassword"] = PfxPassword
        };

        private static async Task SeedPrivateKeyJwtClientAsync(IHost host, string clientId, string scope, RSA clientKey)
        {
            var publicKey = clientKey.ExportParameters(false);
            var jwk = $"{{\"kty\":\"RSA\",\"kid\":\"{clientId}\",\"n\":\"{Base64UrlEncoder.Encode(publicKey.Modulus)}\",\"e\":\"{Base64UrlEncoder.Encode(publicKey.Exponent)}\"}}";

            using var serviceScope = host.Services.CreateScope();
            var dbContext = serviceScope.ServiceProvider.GetRequiredService<IdentityServerConfigurationDbContext>();

            dbContext.ApiScopes.Add(new ApiScope { Name = scope, Enabled = true });
            dbContext.Clients.Add(new Client
            {
                ClientId = clientId,
                ClientName = clientId,
                Enabled = true,
                ProtocolType = "oidc",
                RequireClientSecret = true,
                AllowedGrantTypes = new List<ClientGrantType> { new ClientGrantType { GrantType = "client_credentials" } },
                AllowedScopes = new List<ClientScope> { new ClientScope { Scope = scope } },
                ClientSecrets = new List<ClientSecret> { new ClientSecret { Type = "JWK", Value = jwk } }
            });

            await dbContext.SaveChangesAsync();
        }

        private static Task<TokenResponse> RequestTokenAsync(HttpClient client, DiscoveryDocumentResponse disco, string clientId,
            string scope, RSA clientKey, string algorithm)
        {
            var assertion = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
            {
                Issuer = clientId,
                Audience = disco.Issuer,
                TokenType = "client-authentication+jwt",
                Claims = new Dictionary<string, object>
                {
                    ["sub"] = clientId,
                    ["jti"] = Guid.NewGuid().ToString("N")
                },
                Expires = DateTime.UtcNow.AddMinutes(1),
                SigningCredentials = new SigningCredentials(new RsaSecurityKey(clientKey) { KeyId = clientId }, algorithm)
            });

            return client.RequestClientCredentialsTokenAsync(new ClientCredentialsTokenRequest
            {
                Address = disco.TokenEndpoint,
                ClientId = clientId,
                ClientCredentialStyle = ClientCredentialStyle.PostBody,
                Scope = scope,
                ClientAssertion = new ClientAssertion
                {
                    Type = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
                    Value = assertion
                }
            });
        }

        private static IEnumerable<string> ReadStringArray(DiscoveryDocumentResponse disco, string name)
        {
            return disco.TryGetStringArray(name);
        }

        private static IHost StartHost(bool isProfileEnabled, IDictionary<string, string> settings = null)
        {
            return new HostBuilder()
                .ConfigureAppConfiguration(configApp =>
                {
                    // Not optional - without the file the host would silently run on defaults
                    configApp.AddJsonFile("appsettings.json", optional: false, reloadOnChange: false);
                    configApp.AddInMemoryCollection(new Dictionary<string, string>(settings ?? new Dictionary<string, string>())
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
