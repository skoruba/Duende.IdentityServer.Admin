// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using Duende.IdentityServer.EntityFramework.Entities;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// FAPI 2.0 section 5.4 permits PS256, ES256 and EdDSA only. The list is a closed
    /// enumeration, so the longer variants are non-conformant even though their keys are
    /// larger - that is the part implementers get wrong most often.
    /// </summary>
    public class ClientSigningAlgorithmsMustBeFapiCompliantRuleTests
    {
        private const string MessageTemplate =
            "Client '{clientName}' uses {count} signing algorithm(s) outside this deployment's FAPI 2.0 allow-list: {algorithms}";

        private const string FixTemplate = "Keep only {allowedAlgorithms}.";

        private const string DefaultConfiguration = "{\"allowedAlgorithms\": [\"PS256\", \"ES256\"]}";

        private static List<ConfigurationIssueView> Validate(Client client, string configuration = DefaultConfiguration)
        {
            var context = new ValidationContext { Clients = new List<Client> { client } };

            return new ClientSigningAlgorithmsMustBeFapiCompliantRule()
                .ValidateWithContext(context, configuration, MessageTemplate, FixTemplate, ConfigurationIssueTypeView.Warning);
        }

        private static Client CreateClient(string signingAlgorithms = null, params ClientSecret[] secrets)
            => new()
            {
                Id = 1,
                ClientId = "client_under_test",
                ClientName = "Client Under Test",
                AllowedIdentityTokenSigningAlgorithms = signingAlgorithms,
                ClientSecrets = new List<ClientSecret>(secrets)
            };

        private static ClientSecret JwkSecret(string algorithm)
            => new() { Type = "JWK", Value = "{\"kty\":\"EC\",\"alg\":\"" + algorithm + "\",\"use\":\"sig\"}" };

        [Theory]
        [InlineData("PS256")]
        [InlineData("ES256")]
        [InlineData("PS256,ES256")]
        public void PermittedAlgorithmsAreNotReported(string algorithms)
        {
            Validate(CreateClient(algorithms)).Should().BeEmpty();
        }

        [Theory]
        [InlineData("RS256")]
        [InlineData("RS512")]
        [InlineData("PS384")]
        [InlineData("PS512")]
        [InlineData("ES384")]
        [InlineData("ES512")]
        public void AlgorithmsOutsideTheClosedEnumerationAreReported(string algorithm)
        {
            var issues = Validate(CreateClient(algorithm));

            issues.Should().ContainSingle();
            issues[0].Message.Should().Contain(algorithm);
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.Client);
        }

        [Fact]
        public void JwkSecretCarryingANonPermittedAlgorithmIsReported()
        {
            var issues = Validate(CreateClient(null, JwkSecret("ES512")));

            issues.Should().ContainSingle();
            issues[0].Message.Should().Contain("ES512");
        }

        [Fact]
        public void JwkSecretCarryingAPermittedAlgorithmIsNotReported()
        {
            Validate(CreateClient(null, JwkSecret("PS256"))).Should().BeEmpty();
        }

        [Fact]
        public void BothSourcesAreCombinedIntoASingleIssue()
        {
            var issues = Validate(CreateClient("RS256", JwkSecret("ES384")));

            issues.Should().ContainSingle();
            issues[0].Message.Should().Contain("RS256").And.Contain("ES384");
            issues[0].Message.Should().Contain("2 signing algorithm(s)");
            issues[0].Message.Should().Contain("Client Under Test");
        }

        [Fact]
        public void TheSameAlgorithmFromBothSourcesIsCountedOnce()
        {
            var issues = Validate(CreateClient("RS256", JwkSecret("RS256")));

            issues.Should().ContainSingle();
            issues[0].Message.Should().Contain("1 signing algorithm(s)");
        }

        [Fact]
        public void NonJwkSecretsAreIgnored()
        {
            var secret = new ClientSecret { Type = "SharedSecret", Value = "not a jwk" };

            Validate(CreateClient(null, secret)).Should().BeEmpty();
        }

        [Fact]
        public void MalformedJwkIsIgnored()
        {
            var secret = new ClientSecret { Type = "JWK", Value = "{ not json" };

            Validate(CreateClient(null, secret)).Should().BeEmpty();
        }

        [Fact]
        public void JwkWithoutAlgIsIgnored()
        {
            var secret = new ClientSecret { Type = "JWK", Value = "{\"kty\":\"RSA\"}" };

            Validate(CreateClient(null, secret)).Should().BeEmpty();
        }

        [Fact]
        public void ClientWithoutAnySigningConfigurationIsNotReported()
        {
            Validate(CreateClient()).Should().BeEmpty();
        }

        [Fact]
        public void ConfiguredAllowedAlgorithmsOverrideTheDefault()
        {
            var configuration = "{\"allowedAlgorithms\": [\"PS256\", \"ES256\", \"EdDSA\"]}";

            Validate(CreateClient("EdDSA"), configuration).Should().BeEmpty();
            Validate(CreateClient("RS256"), configuration).Should().ContainSingle();
        }

        [Fact]
        public void AlgorithmComparisonIsCaseSensitiveBecauseJoseAlgValuesAre()
        {
            // "ps256" is not a registered JWA identifier and IdentityServer would not accept it.
            Validate(CreateClient("ps256")).Should().ContainSingle();
        }

        [Fact]
        public void EmptyAllowedAlgorithmsDisablesTheRuleInsteadOfFlaggingEverything()
        {
            Validate(CreateClient("RS256"), "{\"allowedAlgorithms\": []}").Should().BeEmpty();
        }

        [Fact]
        public void FixDescriptionListsTheAllowedAlgorithms()
        {
            var issues = Validate(CreateClient("RS256"));

            issues[0].FixDescription.Should().Contain("PS256").And.Contain("ES256");
        }
    }
}
