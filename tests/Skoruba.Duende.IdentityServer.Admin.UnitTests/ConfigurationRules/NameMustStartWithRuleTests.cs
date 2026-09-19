// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Globalization;
using System.Linq;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.IdentityResourceRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// The five prefix rules are one rule applied to five different names. They are
    /// tested together so that they cannot drift apart without a test noticing.
    /// </summary>
    public class NameMustStartWithRuleTests
    {
        private const string ClientName = nameof(ClientName);
        private const string ClientId = nameof(ClientId);
        private const string ApiScope = nameof(ApiScope);
        private const string ApiResource = nameof(ApiResource);
        private const string IdentityResource = nameof(IdentityResource);

        private const string Prefixes = "{\"prefixes\": [\"app_\", \"svc_\"]}";

        public static TheoryData<string> Targets => [ClientName, ClientId, ApiScope, ApiResource, IdentityResource];

        private static IConfigurationRuleValidator CreateRule(string target) => target switch
        {
            ClientName => new ClientNameMustStartWithRule(),
            ClientId => new ClientIdMustStartWithRule(),
            ApiScope => new ApiScopeNameMustStartWithRule(),
            ApiResource => new ApiResourceNameMustStartWithRule(),
            IdentityResource => new IdentityResourceNameMustStartWithRule(),
            _ => throw new ArgumentOutOfRangeException(nameof(target))
        };

        /// <summary>Builds one resource per name, with ids counting from 1.</summary>
        private static ValidationContext CreateContext(string target, params string[] names)
        {
            var context = new ValidationContext();

            foreach (var (name, id) in names.Select((name, index) => (name, index + 1)))
            {
                switch (target)
                {
                    case ClientName:
                        context.Clients.Add(RuleTestData.Client(clientId: $"client_{id}", clientName: name, id: id));
                        break;
                    case ClientId:
                        context.Clients.Add(RuleTestData.Client(clientId: name, clientName: $"Client {id}", id: id));
                        break;
                    case ApiScope:
                        context.ApiScopes.Add(RuleTestData.ApiScope(name, id: id));
                        break;
                    case ApiResource:
                        context.ApiResources.Add(RuleTestData.ApiResource(name, id));
                        break;
                    case IdentityResource:
                        context.IdentityResources.Add(RuleTestData.IdentityResource(name, id: id));
                        break;
                }
            }

            return context;
        }

        private static ConfigurationResourceType ExpectedResourceType(string target) => target switch
        {
            ApiScope => ConfigurationResourceType.ApiScope,
            ApiResource => ConfigurationResourceType.ApiResource,
            IdentityResource => ConfigurationResourceType.IdentityResource,
            _ => ConfigurationResourceType.Client
        };

        [Theory]
        [MemberData(nameof(Targets))]
        public void NameWithAnyAllowedPrefixIsNotReported(string target)
        {
            CreateRule(target).Validate(CreateContext(target, "app_portal", "svc_orders"), Prefixes)
                .Should().BeEmpty();
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void OnlyTheNameWithoutAnAllowedPrefixIsReported(string target)
        {
            var issues = CreateRule(target).Validate(CreateContext(target, "app_portal", "orders"), Prefixes);

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(2);
            issues[0].ResourceType.Should().Be(ExpectedResourceType(target));
            issues[0].IssueType.Should().Be(ConfigurationIssueTypeView.Warning);
            issues[0].MessageParameters["allowedPrefixes"].Should().Be("app_, svc_");
            issues[0].MessageParameters.Values.Should().Contain("orders");
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void PrefixIsCaseSensitive(string target)
        {
            CreateRule(target).Validate(CreateContext(target, "APP_portal"), Prefixes)
                .Should().ContainSingle();
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void PrefixComparisonDoesNotDependOnTheHostCulture(string target)
        {
            var originalCulture = CultureInfo.CurrentCulture;
            try
            {
                // Czech sorts "ch" as a single letter, so a culture-sensitive "chat".StartsWith("c") is false
                CultureInfo.CurrentCulture = new CultureInfo("cs-CZ");

                CreateRule(target).Validate(CreateContext(target, "chat_portal"), "{\"prefixes\": [\"c\"]}")
                    .Should().BeEmpty();
            }
            finally
            {
                CultureInfo.CurrentCulture = originalCulture;
            }
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void EmptyPrefixesAreIgnored(string target)
        {
            var rule = CreateRule(target);

            // An empty prefix matches every name and a null one would throw
            rule.Validate(CreateContext(target, "orders"), "{\"prefixes\": [\"\", null, \"app_\"]}").Should().ContainSingle();
            rule.Validate(CreateContext(target, "orders"), "{\"prefixes\": [\"\", null]}").Should().BeEmpty();
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void PrefixInTheMiddleOfTheNameDoesNotCount(string target)
        {
            CreateRule(target).Validate(CreateContext(target, "my_app_portal"), Prefixes)
                .Should().ContainSingle();
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void SinglePrefixFromOlderConfigurationsStillWorks(string target)
        {
            var rule = CreateRule(target);

            rule.Validate(CreateContext(target, "app_portal"), "{\"prefix\": \"app_\"}").Should().BeEmpty();
            rule.Validate(CreateContext(target, "orders"), "{\"prefix\": \"app_\"}").Should().ContainSingle();
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void PrefixListWinsOverTheOlderSinglePrefix(string target)
        {
            var configuration = "{\"prefix\": \"old_\", \"prefixes\": [\"new_\"]}";

            CreateRule(target).Validate(CreateContext(target, "old_portal"), configuration)
                .Should().ContainSingle();
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void RuleWithoutAnyPrefixReportsNothingInsteadOfEverything(string target)
        {
            // Clearing the prefix list in the UI must not flag every resource in the store.
            foreach (var configuration in new[] { null, "", "{}", "{\"prefixes\": []}", "{\"prefix\": \"  \"}", "not json" })
            {
                CreateRule(target).Validate(CreateContext(target, "orders"), configuration)
                    .Should().BeEmpty($"configuration '{configuration}' defines no prefix");
            }
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void ClientWithoutANameIsNotHeldToTheClientNameRule(string clientName)
        {
            var context = new ValidationContext { Clients = { RuleTestData.Client(clientName: clientName) } };

            new ClientNameMustStartWithRule().Validate(context, Prefixes).Should().BeEmpty();
        }

        [Fact]
        public void ClientWithoutANameIsStillHeldToTheClientIdRuleAndReportedUnderItsId()
        {
            var context = new ValidationContext { Clients = { RuleTestData.Client(clientId: "orders", clientName: null) } };

            var issues = new ClientIdMustStartWithRule().Validate(context, Prefixes);

            issues.Should().ContainSingle();
            issues[0].ResourceName.Should().Be("orders");
        }

        [Theory]
        [InlineData("openid")]
        [InlineData("profile")]
        [InlineData("email")]
        [InlineData("address")]
        [InlineData("phone")]
        [InlineData("offline_access")]
        [InlineData("OpenId")]
        public void StandardIdentityResourcesAreExemptByDefault(string name)
        {
            var context = CreateContext(IdentityResource, name);

            new IdentityResourceNameMustStartWithRule().Validate(context, Prefixes).Should().BeEmpty();
        }

        [Fact]
        public void StandardIdentityResourcesAreReportedOnceTheExemptionIsTurnedOff()
        {
            var configuration = "{\"prefixes\": [\"app_\"], \"excludeStandard\": false}";

            new IdentityResourceNameMustStartWithRule().Validate(CreateContext(IdentityResource, "openid"), configuration)
                .Should().ContainSingle();
        }

        [Fact]
        public void IdentityResourceIsReportedUnderItsDisplayName()
        {
            var context = new ValidationContext
            {
                IdentityResources = { RuleTestData.IdentityResource("roles", displayName: "User roles") }
            };

            var issues = new IdentityResourceNameMustStartWithRule().Validate(context, Prefixes);

            issues.Should().ContainSingle();
            issues[0].MessageParameters["displayName"].Should().Be("User roles");
            issues[0].MessageParameters["actualName"].Should().Be("roles");
        }
    }
}
