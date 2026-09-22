// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    public class ScopeIsUnusedRuleTests
    {
        [Fact]
        public void ScopeAllowedForAClientIsUsed()
        {
            var context = new ValidationContext
            {
                ApiScopes = { RuleTestData.ApiScope("orders.read") },
                Clients = { RuleTestData.Client(scopes: ["orders.read"]) }
            };

            new ScopeIsUnusedRule().Validate(context).Should().BeEmpty();
        }

        [Fact]
        public void ScopeAttachedToAnApiResourceIsUsed()
        {
            var context = new ValidationContext
            {
                ApiScopes = { RuleTestData.ApiScope("orders.read") },
                ApiResources = { RuleTestData.ApiResource("orders", 1, "orders.read") }
            };

            new ScopeIsUnusedRule().Validate(context).Should().BeEmpty();
        }

        [Fact]
        public void ScopeNobodyRefersToIsReported()
        {
            var context = new ValidationContext
            {
                ApiScopes =
                {
                    RuleTestData.ApiScope("orders.read", id: 1),
                    RuleTestData.ApiScope("orders.write", displayName: "Write orders", description: "Creates orders", id: 2)
                },
                Clients = { RuleTestData.Client(scopes: ["orders.read"]) }
            };

            var issues = new ScopeIsUnusedRule().Validate(context);

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(2);
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.ApiScope);
            issues[0].MessageParameters["scopeName"].Should().Be("orders.write");
            issues[0].MessageParameters["displayNameSuffix"].Should().Be(" (Write orders)");
            issues[0].MessageParameters["description"].Should().Be("Creates orders");
        }

        [Fact]
        public void ScopeWithoutADisplayNameGetsNoSuffixAndAPlaceholderDescription()
        {
            var context = new ValidationContext { ApiScopes = { RuleTestData.ApiScope("orders.write") } };

            var issues = new ScopeIsUnusedRule().Validate(context);

            issues.Should().ContainSingle();
            issues[0].MessageParameters["displayNameSuffix"].Should().BeEmpty();
            issues[0].MessageParameters["description"].Should().Be("No description");
        }

        [Theory]
        [InlineData("openid")]
        [InlineData("profile")]
        [InlineData("email")]
        [InlineData("address")]
        [InlineData("phone")]
        [InlineData("offline_access")]
        public void StandardScopesAreIgnoredByDefault(string scope)
        {
            var context = new ValidationContext { ApiScopes = { RuleTestData.ApiScope(scope) } };

            new ScopeIsUnusedRule().Validate(context).Should().BeEmpty();
        }

        [Fact]
        public void ConfiguredExclusionsReplaceTheDefaultOnes()
        {
            var context = new ValidationContext
            {
                ApiScopes = { RuleTestData.ApiScope("internal", id: 1), RuleTestData.ApiScope("email", id: 2) }
            };

            var issues = new ScopeIsUnusedRule().Validate(context, "{\"excludeScopes\": [\"internal\"]}");

            issues.Should().ContainSingle();
            issues[0].MessageParameters["scopeName"].Should().Be("email");
        }

        [Theory]
        [InlineData("Internal.Scope", "Internal.Scope")]
        [InlineData("internal.scope", "Internal.Scope")]
        [InlineData("Internal.Scope", "internal.scope")]
        public void ExclusionMatchesTheScopeRegardlessOfCase(string scope, string excludedScope)
        {
            var context = new ValidationContext { ApiScopes = { RuleTestData.ApiScope(scope) } };

            new ScopeIsUnusedRule().Validate(context, "{\"excludeScopes\": [\"" + excludedScope + "\"]}")
                .Should().BeEmpty();
        }
    }
}
