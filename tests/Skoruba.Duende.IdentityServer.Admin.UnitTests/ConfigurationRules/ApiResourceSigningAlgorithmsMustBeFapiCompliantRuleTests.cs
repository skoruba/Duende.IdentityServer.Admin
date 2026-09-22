// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using Duende.IdentityServer.EntityFramework.Entities;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// The access token signing algorithm is decided by the API resource, so a resource
    /// allowing RS256 makes every client requesting its scopes non-conformant regardless
    /// of the client's own configuration.
    /// </summary>
    public class ApiResourceSigningAlgorithmsMustBeFapiCompliantRuleTests
    {
        private const string MessageTemplate =
            "API Resource '{resourceName}' allows {count} access token signing algorithm(s) outside this deployment's FAPI 2.0 allow-list: {algorithms}";

        private const string FixTemplate = "Keep only {allowedAlgorithms}.";

        private const string DefaultConfiguration = "{\"allowedAlgorithms\": [\"PS256\", \"ES256\"]}";

        private static List<ConfigurationIssueView> Validate(ApiResource apiResource, string configuration = DefaultConfiguration)
        {
            var context = new ValidationContext { ApiResources = new List<ApiResource> { apiResource } };

            return new ApiResourceSigningAlgorithmsMustBeFapiCompliantRule()
                .ValidateWithContext(context, configuration, MessageTemplate, FixTemplate, ConfigurationIssueTypeView.Warning);
        }

        private static ApiResource CreateApiResource(string signingAlgorithms = null)
            => new()
            {
                Id = 1,
                Name = "api_under_test",
                DisplayName = "API Under Test",
                AllowedAccessTokenSigningAlgorithms = signingAlgorithms
            };

        [Theory]
        [InlineData("PS256")]
        [InlineData("ES256")]
        [InlineData("PS256,ES256")]
        [InlineData(" PS256 , ES256 ")]
        public void PermittedAlgorithmsAreNotReported(string algorithms)
        {
            Validate(CreateApiResource(algorithms)).Should().BeEmpty();
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
            var issues = Validate(CreateApiResource(algorithm));

            issues.Should().ContainSingle();
            issues[0].Message.Should().Contain(algorithm).And.Contain("api_under_test");
            issues[0].ResourceId.Should().Be(1);
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.ApiResource);
        }

        [Fact]
        public void OnlyTheOffendingAlgorithmsAreListed()
        {
            var issues = Validate(CreateApiResource("PS256,RS256,ES512"));

            issues.Should().ContainSingle();
            issues[0].Message.Should().Contain("2 access token signing algorithm(s)");
            issues[0].Message.Should().Contain("RS256").And.Contain("ES512").And.NotContain("PS256");
        }

        [Fact]
        public void DuplicateAlgorithmsAreCountedOnce()
        {
            var issues = Validate(CreateApiResource("RS256,RS256"));

            issues.Should().ContainSingle();
            issues[0].Message.Should().Contain("1 access token signing algorithm(s)");
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void ServerDefaultIsNotReported(string algorithms)
        {
            // An empty list means IdentityServer's default signing algorithm, which the
            // STS profile controls rather than the API resource.
            Validate(CreateApiResource(algorithms)).Should().BeEmpty();
        }

        [Fact]
        public void ConfiguredAllowedAlgorithmsOverrideTheDefault()
        {
            var configuration = "{\"allowedAlgorithms\": [\"PS256\", \"ES256\", \"EdDSA\"]}";

            Validate(CreateApiResource("EdDSA"), configuration).Should().BeEmpty();
            Validate(CreateApiResource("RS256"), configuration).Should().ContainSingle();
        }

        [Fact]
        public void AlgorithmComparisonIsCaseSensitiveBecauseJoseAlgValuesAre()
        {
            Validate(CreateApiResource("ps256")).Should().ContainSingle();
        }

        [Fact]
        public void EmptyAllowedAlgorithmsDisablesTheRuleInsteadOfFlaggingEverything()
        {
            Validate(CreateApiResource("RS256"), "{\"allowedAlgorithms\": []}").Should().BeEmpty();
        }

        [Fact]
        public void FixDescriptionListsTheAllowedAlgorithms()
        {
            var issues = Validate(CreateApiResource("RS256"));

            issues[0].FixDescription.Should().Contain("PS256").And.Contain("ES256");
        }
    }
}
