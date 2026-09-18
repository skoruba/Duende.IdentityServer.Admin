// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// A client keeps the name of a scope, not a reference to it, so deleting or
    /// renaming a scope leaves the client asking for something that no longer exists.
    /// </summary>
    public class ClientScopeMustExistRuleTests
    {
        private static ValidationContext CreateContext(params string[] clientScopes)
            => new()
            {
                Clients = { RuleTestData.Client(scopes: clientScopes) },
                ApiScopes = { RuleTestData.ApiScope("orders.read") },
                IdentityResources = { RuleTestData.IdentityResource("openid") }
            };

        [Fact]
        public void ScopeBackedByAnApiScopeOrAnIdentityResourceIsNotReported()
        {
            new ClientScopeMustExistRule().Validate(CreateContext("orders.read", "openid"))
                .Should().BeEmpty();
        }

        [Fact]
        public void ScopesThatNoLongerExistAreListedInOneIssue()
        {
            var issues = new ClientScopeMustExistRule()
                .Validate(CreateContext("orders.read", "orders.write", "invoices"));

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(1);
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.Client);
            issues[0].MessageParameters["missingScopes"].Should().Be("orders.write, invoices");
            issues[0].MessageParameters["count"].Should().Be("2");
            issues[0].MessageParameters["clientName"].Should().Be("Client Under Test");
        }

        [Fact]
        public void ScopeNamesAreCaseSensitiveBecauseOAuthScopesAre()
        {
            new ClientScopeMustExistRule().Validate(CreateContext("Orders.Read"))
                .Should().ContainSingle();
        }

        [Fact]
        public void MissingScopeListedTwiceIsCountedOnce()
        {
            var issues = new ClientScopeMustExistRule().Validate(CreateContext("invoices", "invoices"));

            issues.Should().ContainSingle();
            issues[0].MessageParameters["count"].Should().Be("1");
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("{}")]
        public void OfflineAccessIsIgnoredByDefault(string configuration)
        {
            // offline_access is a protocol scope - it is never stored as an API scope.
            new ClientScopeMustExistRule().Validate(CreateContext("offline_access"), configuration)
                .Should().BeEmpty();
        }

        [Fact]
        public void ConfiguredExclusionsReplaceTheDefaultOnes()
        {
            var configuration = "{\"excludeScopes\": [\"legacy\"]}";

            var issues = new ClientScopeMustExistRule()
                .Validate(CreateContext("legacy", "offline_access"), configuration);

            issues.Should().ContainSingle();
            issues[0].MessageParameters["missingScopes"].Should().Be("offline_access");
        }

        [Theory]
        [InlineData("Legacy.Scope", "Legacy.Scope")]
        [InlineData("legacy.scope", "Legacy.Scope")]
        [InlineData("Legacy.Scope", "legacy.scope")]
        public void ExclusionMatchesTheScopeRegardlessOfCase(string clientScope, string excludedScope)
        {
            var configuration = "{\"excludeScopes\": [\"" + excludedScope + "\"]}";

            new ClientScopeMustExistRule().Validate(CreateContext(clientScope), configuration)
                .Should().BeEmpty();
        }

        [Fact]
        public void ClientWithoutANameIsReportedUnderItsClientId()
        {
            var context = new ValidationContext
            {
                Clients = { RuleTestData.Client(clientId: "orders_client", clientName: null, scopes: ["invoices"]) }
            };

            var issues = new ClientScopeMustExistRule().Validate(context);

            issues.Should().ContainSingle();
            issues[0].ResourceName.Should().Be("orders_client");
        }

        [Fact]
        public void EachClientGetsItsOwnIssue()
        {
            var context = new ValidationContext
            {
                Clients =
                {
                    RuleTestData.Client(clientId: "first", id: 1, scopes: ["invoices"]),
                    RuleTestData.Client(clientId: "second", id: 2, scopes: ["orders.read"]),
                    RuleTestData.Client(clientId: "third", id: 3, scopes: ["payments"])
                },
                ApiScopes = { RuleTestData.ApiScope("orders.read") }
            };

            var issues = new ClientScopeMustExistRule().Validate(context);

            issues.Should().HaveCount(2);
            issues.Should().OnlyContain(issue => issue.ResourceId == 1 || issue.ResourceId == 3);
        }
    }
}
