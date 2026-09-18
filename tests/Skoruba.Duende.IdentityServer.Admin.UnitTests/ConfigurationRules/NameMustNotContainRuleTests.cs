// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// The forbidden string rules are one rule applied to three different names, so
    /// they are tested together - see <see cref="NameMustStartWithRuleTests"/>.
    /// </summary>
    public class NameMustNotContainRuleTests
    {
        private const string ClientName = nameof(ClientName);
        private const string ClientId = nameof(ClientId);
        private const string ApiScope = nameof(ApiScope);

        private const string ForbiddenStrings = "{\"forbiddenStrings\": [\"test\", \"temp\"]}";

        public static TheoryData<string> Targets => [ClientName, ClientId, ApiScope];

        private static IConfigurationRuleValidator CreateRule(string target) => target switch
        {
            ClientName => new ClientNameMustNotContainRule(),
            ClientId => new ClientIdMustNotContainRule(),
            ApiScope => new ApiScopeNameMustNotContainRule(),
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
                }
            }

            return context;
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void NameWithoutAForbiddenStringIsNotReported(string target)
        {
            CreateRule(target).Validate(CreateContext(target, "orders", "portal"), ForbiddenStrings)
                .Should().BeEmpty();
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void OnlyTheNameWithAForbiddenStringIsReported(string target)
        {
            var issues = CreateRule(target).Validate(CreateContext(target, "orders", "orders_test"), ForbiddenStrings);

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(2);
            issues[0].ResourceType.Should().Be(
                target == ApiScope ? ConfigurationResourceType.ApiScope : ConfigurationResourceType.Client);
            issues[0].MessageParameters["forbiddenStrings"].Should().Be("test");
            issues[0].MessageParameters["allForbiddenStrings"].Should().Be("test, temp");
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void ForbiddenStringIsFoundAnywhereAndInAnyCase(string target)
        {
            var rule = CreateRule(target);

            rule.Validate(CreateContext(target, "TestOrders"), ForbiddenStrings).Should().ContainSingle();
            rule.Validate(CreateContext(target, "my_TEMP_orders"), ForbiddenStrings).Should().ContainSingle();
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void EveryForbiddenStringFoundIsListedInOneIssue(string target)
        {
            var issues = CreateRule(target).Validate(CreateContext(target, "temp_test_orders"), ForbiddenStrings);

            issues.Should().ContainSingle();
            issues[0].MessageParameters["forbiddenStrings"].Should().Be("test, temp");
        }

        [Theory]
        [MemberData(nameof(Targets))]
        public void RuleWithoutAnyForbiddenStringReportsNothing(string target)
        {
            foreach (var configuration in new[] { null, "", "{}", "{\"forbiddenStrings\": []}", "not json" })
            {
                CreateRule(target).Validate(CreateContext(target, "orders_test"), configuration)
                    .Should().BeEmpty($"configuration '{configuration}' forbids nothing");
            }
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void ClientWithoutANameIsNotHeldToTheClientNameRule(string clientName)
        {
            var context = new ValidationContext { Clients = { RuleTestData.Client(clientName: clientName) } };

            new ClientNameMustNotContainRule().Validate(context, ForbiddenStrings).Should().BeEmpty();
        }

        [Fact]
        public void ClientIdRuleDoesNotLookAtTheClientName()
        {
            var context = new ValidationContext
            {
                Clients = { RuleTestData.Client(clientId: "orders", clientName: "Test Orders") }
            };

            new ClientIdMustNotContainRule().Validate(context, ForbiddenStrings).Should().BeEmpty();
            new ClientNameMustNotContainRule().Validate(context, ForbiddenStrings).Should().ContainSingle();
        }
    }
}
