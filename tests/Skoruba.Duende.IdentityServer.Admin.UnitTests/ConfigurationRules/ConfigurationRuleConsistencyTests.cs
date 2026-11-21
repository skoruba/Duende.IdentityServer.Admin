// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using Duende.IdentityServer.EntityFramework.Entities;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Helpers;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// A built-in rule lives in three places - its key in <see cref="ConfigurationRuleKeys"/>,
    /// its class (metadata and check) and the seeded defaults. Nothing but these tests ties
    /// them together, so a key added without a class would only fail at runtime.
    /// </summary>
    public class ConfigurationRuleConsistencyTests
    {
        private static readonly Regex Placeholder = new(@"\{\w+\}", RegexOptions.Compiled);

        public static TheoryData<string> RuleTypes => new(ConfigurationRuleKeys.BuiltIn);

        private static ConfigurationRule GetSeededRule(string ruleType)
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
        public void BuiltInKeysAreWellFormedAndUnique()
        {
            ConfigurationRuleKeys.BuiltIn.Should().OnlyHaveUniqueItems();

            foreach (var key in ConfigurationRuleKeys.BuiltIn)
            {
                ConfigurationRuleKeys.IsWellFormed(key).Should().BeTrue(key);
                ConfigurationRuleKeys.IsCustom(key).Should().BeFalse($"a built-in key has no namespace, but '{key}' has one");
            }
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void EveryBuiltInKeyIsRegisteredAsBuiltIn(string ruleType)
        {
            var descriptor = BuiltInRules.Registry.Find(ruleType);

            descriptor.Should().NotBeNull();
            descriptor.IsBuiltIn.Should().BeTrue();
            descriptor.Metadata.Key.Should().Be(ruleType);
        }

        [Fact]
        public void RegistryHoldsNothingBeyondTheBuiltInKeys()
        {
            BuiltInRules.Registry.Rules.Select(descriptor => descriptor.Key)
                .Should().BeEquivalentTo(ConfigurationRuleKeys.BuiltIn);
        }

        [Fact]
        public void EveryRuleTypeHasItsOwnValidator()
        {
            var validatorTypes = ConfigurationRuleKeys.BuiltIn
                .Select(ruleType => BuiltInRules.Factory.Create(ruleType).GetType())
                .ToList();

            // Two rule types sharing a validator is a copy and paste slip in the registration.
            validatorTypes.Should().OnlyHaveUniqueItems();
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void ValidatorIsNamedAfterItsRuleType(string ruleType)
        {
            BuiltInRules.Factory.Create(ruleType).GetType().Name.Should().Be($"{ruleType}Rule");
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void RuleTypeIsDescribedForTheUi(string ruleType)
        {
            var metadata = BuiltInRules.MetadataProvider.GetMetadata(ruleType);

            metadata.Should().NotBeNull();
            metadata.RuleType.Should().Be(ruleType);
            metadata.DisplayName.Should().NotBeNullOrWhiteSpace();
            metadata.Description.Should().NotBeNullOrWhiteSpace();
            metadata.DefaultMessageTemplate.Should().NotBeNullOrWhiteSpace();
            metadata.DefaultFixDescription.Should().NotBeNullOrWhiteSpace();
            Enum.TryParse<ConfigurationResourceType>(metadata.ResourceType, out _).Should().BeTrue();

            // The Admin UI renders an input per parameter type and knows these four.
            metadata.Parameters.Select(parameter => parameter.Type)
                .Should().BeSubsetOf(new[] { "string", "number", "boolean", "array" });
        }

        [Fact]
        public void MetadataDescribesNothingBeyondTheRuleTypes()
        {
            BuiltInRules.MetadataProvider.GetAllMetadata()
                .Should().HaveCount(ConfigurationRuleKeys.BuiltIn.Count);
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void RuleTypeIsSeededOnceAndAgreesWithItsMetadata(string ruleType)
        {
            var metadata = BuiltInRules.MetadataProvider.GetMetadata(ruleType);

            var seededRule = GetSeededRule(ruleType);

            seededRule.ResourceType.ToString().Should().Be(metadata.ResourceType);
            seededRule.MessageTemplate.Should().Be(metadata.DefaultMessageTemplate);
            seededRule.FixDescription.Should().Be(metadata.DefaultFixDescription);
            Normalize(seededRule.Configuration).Should().Be(Normalize(metadata.DefaultConfiguration));
        }

        [Theory]
        [MemberData(nameof(RuleTypes))]
        public void ConfigurationsUseOnlyTheDeclaredParameters(string ruleType)
        {
            var metadata = BuiltInRules.MetadataProvider.GetMetadata(ruleType);
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
        public void SeededRuleReportsAnIssueWithEveryPlaceholderFilledIn(string ruleType)
        {
            var seededRule = GetSeededRule(ruleType);

            var issues = BuiltInRules.Factory.Create(ruleType).ValidateWithContext(
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
        public void ClientWithoutANameIsReportedUnderItsClientId(string ruleType)
        {
            var context = CreateContextBreakingEveryRule();
            context.Clients.ForEach(client => client.ClientName = null);
            var clientIdsById = context.Clients.ToDictionary(client => client.Id, client => client.ClientId);
            var seededRule = GetSeededRule(ruleType);

            var clientIssues = BuiltInRules.Factory.Create(ruleType)
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
        public void RuleCopesWithAnEmptyStoreAndNoConfiguration(string ruleType)
        {
            BuiltInRules.Factory.Create(ruleType)
                .Validate(new ValidationContext(), configuration: null)
                .Should().BeEmpty();
        }

        [Fact]
        public void FactoryCreatesAFreshInstanceForEveryRun()
        {
            var first = BuiltInRules.Factory.Create(ConfigurationRuleKeys.MissingPkce);
            var second = BuiltInRules.Factory.Create(ConfigurationRuleKeys.MissingPkce);

            // A rule may keep the state of one run, so two runs must never share an instance.
            second.Should().NotBeSameAs(first);
        }

        [Fact]
        public void SeededIdsStayStable()
        {
            // The migrations refer to the seeded rules by Id, so a new rule type goes to
            // the end of the list - never in between.
            var expectedOrder = new[]
            {
                ConfigurationRuleKeys.ObsoleteImplicitGrant,
                ConfigurationRuleKeys.ObsoletePasswordGrant,
                ConfigurationRuleKeys.MissingPkce,
                ConfigurationRuleKeys.ClientMustHaveScopes,
                ConfigurationRuleKeys.ApiResourceMustHaveScopes,
                ConfigurationRuleKeys.ClientRedirectUrisMustUseHttps,
                ConfigurationRuleKeys.ClientAccessTokenLifetimeTooLong,
                ConfigurationRuleKeys.ClientRefreshTokenLifetimeTooLong,
                ConfigurationRuleKeys.ApiScopeNameMustStartWith,
                ConfigurationRuleKeys.ApiScopeNameMustNotContain,
                ConfigurationRuleKeys.ApiScopeMustHaveDisplayName,
                ConfigurationRuleKeys.ApiResourceNameMustStartWith,
                ConfigurationRuleKeys.IdentityResourceMustBeEnabled,
                ConfigurationRuleKeys.IdentityResourceNameMustStartWith,
                ConfigurationRuleKeys.ScopeIsUnused,
                ConfigurationRuleKeys.SecretIsExpiredInDays,
                ConfigurationRuleKeys.ClientNameMustStartWith,
                ConfigurationRuleKeys.ClientNameMustNotContain,
                ConfigurationRuleKeys.ClientIdMustStartWith,
                ConfigurationRuleKeys.ClientIdMustNotContain,
                ConfigurationRuleKeys.ClientScopeMustExist,
                ConfigurationRuleKeys.ClientSigningAlgorithmsMustBeFapiCompliant,
                ConfigurationRuleKeys.ApiResourceSigningAlgorithmsMustBeFapiCompliant
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
                    ConfigurationRuleKeys.ObsoleteImplicitGrant,
                    ConfigurationRuleKeys.ObsoletePasswordGrant,
                    ConfigurationRuleKeys.MissingPkce,
                    ConfigurationRuleKeys.ClientMustHaveScopes,
                    ConfigurationRuleKeys.ApiResourceMustHaveScopes
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
