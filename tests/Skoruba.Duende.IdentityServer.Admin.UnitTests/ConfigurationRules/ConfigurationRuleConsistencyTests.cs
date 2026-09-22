// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using Duende.IdentityServer.EntityFramework.Entities;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Helpers;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// A rule type lives in four places - the enum, the validator factory, the metadata
    /// shown in the UI and the seeded defaults. Nothing but these tests ties them
    /// together, so a rule added to the enum alone would only fail at runtime.
    /// </summary>
    public class ConfigurationRuleConsistencyTests
    {
        private static readonly Regex Placeholder = new(@"\{\w+\}", RegexOptions.Compiled);

        public static TheoryData<ConfigurationRuleType> RuleTypes => new(Enum.GetValues<ConfigurationRuleType>());

        private static ConfigurationRule GetSeededRule(ConfigurationRuleType ruleType)
            => ConfigurationRuleSeedHelper.GetSeedData().Single(rule => rule.RuleType == ruleType);

        /// <summary>
        /// One store in which every rule finds something to report when it runs with
        /// its seeded configuration.
        /// </summary>
        private static ValidationContext CreateContextBreakingEveryRule()
        {
            var clientWithoutScopes = RuleTestData.Client(
                clientId: "test_orders",
                clientName: "test orders",
                id: 1,
                grantTypes: ["authorization_code", "implicit", "password"],
                redirectUris: ["http://app.example.com/signin-oidc"]);
            clientWithoutScopes.RequirePkce = false;

            var clientWithLongLivedTokens = RuleTestData.Client(
                clientId: "client_invoices",
                clientName: "Client Invoices",
                id: 2,
                scopes: ["scope_that_was_deleted"],
                secrets: [new ClientSecret { Expiration = DateTime.UtcNow.AddDays(2) }]);
            clientWithLongLivedTokens.AccessTokenLifetime = 86400;
            clientWithLongLivedTokens.AbsoluteRefreshTokenLifetime = 31536000;
            clientWithLongLivedTokens.AllowedIdentityTokenSigningAlgorithms = "RS256";

            var apiResource = RuleTestData.ApiResource("orders");
            apiResource.AllowedAccessTokenSigningAlgorithms = "RS256";

            return new ValidationContext
            {
                Clients = { clientWithoutScopes, clientWithLongLivedTokens },
                ApiScopes = { RuleTestData.ApiScope("test_unused") },
                ApiResources = { apiResource },
                IdentityResources =
                {
                    RuleTestData.IdentityResource("openid", enabled: false, id: 1),
                    RuleTestData.IdentityResource("roles", id: 2)
                }
            };
        }

        [Fact]
        public void EveryRuleTypeHasItsOwnValidator()
        {
            var factory = new ConfigurationRuleValidatorFactory();

            var validatorTypes = Enum.GetValues<ConfigurationRuleType>()
                .Select(ruleType => factory.Create(ruleType).GetType())
                .ToList();

            // Two rule types sharing a validator is a copy and paste slip in the factory.
            validatorTypes.Should().OnlyHaveUniqueItems();
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void ValidatorIsNamedAfterItsRuleType(ConfigurationRuleType ruleType)
        {
            new ConfigurationRuleValidatorFactory().Create(ruleType).GetType().Name
                .Should().Be($"{ruleType}Rule");
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void RuleTypeIsDescribedForTheUi(ConfigurationRuleType ruleType)
        {
            var metadata = new ConfigurationRuleMetadataProvider().GetMetadata(ruleType);

            metadata.Should().NotBeNull();
            metadata.RuleType.Should().Be(ruleType.ToString());
            metadata.DisplayName.Should().NotBeNullOrWhiteSpace();
            metadata.Description.Should().NotBeNullOrWhiteSpace();
            metadata.DefaultMessageTemplate.Should().NotBeNullOrWhiteSpace();
            metadata.DefaultFixDescription.Should().NotBeNullOrWhiteSpace();
            Enum.TryParse<ConfigurationResourceType>(metadata.ResourceType, out _).Should().BeTrue();
        }

        [Fact]
        public void MetadataDescribesNothingBeyondTheRuleTypes()
        {
            new ConfigurationRuleMetadataProvider().GetAllMetadata()
                .Should().HaveCount(Enum.GetValues<ConfigurationRuleType>().Length);
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void RuleTypeIsSeededOnceAndAgreesWithItsMetadata(ConfigurationRuleType ruleType)
        {
            var metadata = new ConfigurationRuleMetadataProvider().GetMetadata(ruleType);

            var seededRule = GetSeededRule(ruleType);

            seededRule.ResourceType.ToString().Should().Be(metadata.ResourceType);
            seededRule.MessageTemplate.Should().Be(metadata.DefaultMessageTemplate);
            seededRule.FixDescription.Should().Be(metadata.DefaultFixDescription);
            Normalize(seededRule.Configuration).Should().Be(Normalize(metadata.DefaultConfiguration));
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void ConfigurationsUseOnlyTheDeclaredParameters(ConfigurationRuleType ruleType)
        {
            var metadata = new ConfigurationRuleMetadataProvider().GetMetadata(ruleType);
            var declaredParameters = (metadata.Parameters ?? []).Select(parameter => parameter.Name).ToList();

            foreach (var configuration in new[] { metadata.DefaultConfiguration, metadata.ExampleConfiguration })
            {
                if (string.IsNullOrWhiteSpace(configuration))
                {
                    continue;
                }

                using var document = JsonDocument.Parse(configuration);

                document.RootElement.EnumerateObject().Select(property => property.Name)
                    .Should().BeSubsetOf(declaredParameters, $"'{configuration}' is what the UI offers for {ruleType}");
            }
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void SeededRuleReportsAnIssueWithEveryPlaceholderFilledIn(ConfigurationRuleType ruleType)
        {
            var seededRule = GetSeededRule(ruleType);

            var issues = new ConfigurationRuleValidatorFactory().Create(ruleType).ValidateWithContext(
                CreateContextBreakingEveryRule(),
                seededRule.Configuration,
                seededRule.MessageTemplate,
                seededRule.FixDescription,
                ConfigurationIssueTypeView.Warning);

            issues.Should().NotBeEmpty("the context is built to break every rule");

            foreach (var issue in issues)
            {
                // A placeholder the rule does not supply would reach the user as "{name}".
                Placeholder.Matches(issue.Message).Should().BeEmpty($"message was '{issue.Message}'");
                Placeholder.Matches(issue.FixDescription).Should().BeEmpty($"fix was '{issue.FixDescription}'");
                issue.ResourceType.Should().Be(seededRule.ResourceType);
                issue.ResourceName.Should().NotBeNullOrWhiteSpace();
                issue.ResourceId.Should().BePositive();
            }
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void ClientWithoutANameIsReportedUnderItsClientId(ConfigurationRuleType ruleType)
        {
            var context = CreateContextBreakingEveryRule();
            context.Clients.ForEach(client => client.ClientName = null);
            var clientIdsById = context.Clients.ToDictionary(client => client.Id, client => client.ClientId);
            var seededRule = GetSeededRule(ruleType);

            var clientIssues = new ConfigurationRuleValidatorFactory().Create(ruleType)
                .Validate(context, seededRule.Configuration)
                .Where(issue => issue.ResourceType == ConfigurationResourceType.Client);

            // The name is the link text in the issues table - without it there is
            // nothing to click on.
            foreach (var issue in clientIssues)
            {
                issue.ResourceName.Should().Be(clientIdsById[issue.ResourceId]);
            }
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void RuleCopesWithAnEmptyStoreAndNoConfiguration(ConfigurationRuleType ruleType)
        {
            new ConfigurationRuleValidatorFactory().Create(ruleType)
                .Validate(new ValidationContext(), configuration: null)
                .Should().BeEmpty();
        }

        [Fact]
        public void SeededIdsStayStable()
        {
            // The migrations refer to the seeded rules by Id, so a new rule type goes to
            // the end of the list - never in between.
            var expectedOrder = new[]
            {
                ConfigurationRuleType.ObsoleteImplicitGrant,
                ConfigurationRuleType.ObsoletePasswordGrant,
                ConfigurationRuleType.MissingPkce,
                ConfigurationRuleType.ClientMustHaveScopes,
                ConfigurationRuleType.ApiResourceMustHaveScopes,
                ConfigurationRuleType.ClientRedirectUrisMustUseHttps,
                ConfigurationRuleType.ClientAccessTokenLifetimeTooLong,
                ConfigurationRuleType.ClientRefreshTokenLifetimeTooLong,
                ConfigurationRuleType.ApiScopeNameMustStartWith,
                ConfigurationRuleType.ApiScopeNameMustNotContain,
                ConfigurationRuleType.ApiScopeMustHaveDisplayName,
                ConfigurationRuleType.ApiResourceNameMustStartWith,
                ConfigurationRuleType.IdentityResourceMustBeEnabled,
                ConfigurationRuleType.IdentityResourceNameMustStartWith,
                ConfigurationRuleType.ScopeIsUnused,
                ConfigurationRuleType.SecretIsExpiredInDays,
                ConfigurationRuleType.ClientNameMustStartWith,
                ConfigurationRuleType.ClientNameMustNotContain,
                ConfigurationRuleType.ClientIdMustStartWith,
                ConfigurationRuleType.ClientIdMustNotContain,
                ConfigurationRuleType.ClientScopeMustExist,
                ConfigurationRuleType.ClientSigningAlgorithmsMustBeFapiCompliant,
                ConfigurationRuleType.ApiResourceSigningAlgorithmsMustBeFapiCompliant
            };

            var seedData = ConfigurationRuleSeedHelper.GetSeedData();

            seedData.Select(rule => rule.Id).Should().Equal(Enumerable.Range(1, expectedOrder.Length));
            seedData.Select(rule => rule.RuleType).Should().Equal(expectedOrder);
        }

        [Fact]
        public void OnlyTheRulesThatNeedNoConfigurationAreSeededEnabled()
        {
            ConfigurationRuleSeedHelper.GetSeedData().Where(rule => rule.IsEnabled).Select(rule => rule.RuleType)
                .Should().BeEquivalentTo(new[]
                {
                    ConfigurationRuleType.ObsoleteImplicitGrant,
                    ConfigurationRuleType.ObsoletePasswordGrant,
                    ConfigurationRuleType.MissingPkce,
                    ConfigurationRuleType.ClientMustHaveScopes,
                    ConfigurationRuleType.ApiResourceMustHaveScopes
                });
        }

        /// <summary>Compares configurations as JSON, so that spacing does not matter.</summary>
        private static string Normalize(string configuration)
        {
            if (string.IsNullOrWhiteSpace(configuration))
            {
                return null;
            }

            using var document = JsonDocument.Parse(configuration);
            return JsonSerializer.Serialize(document.RootElement);
        }
    }
}
