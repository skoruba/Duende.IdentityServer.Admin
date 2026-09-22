// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiResourceRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// Covers the rules that compare a number on the resource with a configured limit:
    /// token lifetimes and the minimum number of scopes.
    /// </summary>
    public class ClientLimitRuleTests
    {
        private static ValidationContext ClientWithLifetimes(int accessTokenLifetime = 3600, int refreshTokenLifetime = 2592000)
        {
            var client = RuleTestData.Client();
            client.AccessTokenLifetime = accessTokenLifetime;
            client.AbsoluteRefreshTokenLifetime = refreshTokenLifetime;

            return new ValidationContext { Clients = { client } };
        }

        private static string[] Scopes(int count)
            => Enumerable.Range(0, count).Select(index => $"scope_{index}").ToArray();

        [Theory]
        [InlineData(null, 3600, false)]
        [InlineData(null, 3601, true)]
        [InlineData("{\"maxLifetimeSeconds\": 600}", 600, false)]
        [InlineData("{\"maxLifetimeSeconds\": 600}", 601, true)]
        // Zero or less is not a usable limit, so the one hour default applies instead.
        [InlineData("{\"maxLifetimeSeconds\": 0}", 3600, false)]
        [InlineData("{\"maxLifetimeSeconds\": -5}", 3601, true)]
        public void AccessTokenLifetimeIsReportedOnlyAboveTheLimit(string configuration, int lifetime, bool isReported)
        {
            var issues = new ClientAccessTokenLifetimeTooLongRule()
                .Validate(ClientWithLifetimes(accessTokenLifetime: lifetime), configuration);

            issues.Should().HaveCount(isReported ? 1 : 0);
        }

        [Fact]
        public void AccessTokenIssueCarriesBothLifetimes()
        {
            var issues = new ClientAccessTokenLifetimeTooLongRule()
                .Validate(ClientWithLifetimes(accessTokenLifetime: 7200), "{\"maxLifetimeSeconds\": 900}");

            issues.Should().ContainSingle();
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.Client);
            issues[0].MessageParameters["maxLifetime"].Should().Be("900");
            issues[0].MessageParameters["actualLifetime"].Should().Be("7200");
        }

        [Theory]
        [InlineData(null, 2592000, false)]
        [InlineData(null, 2592001, true)]
        [InlineData("{\"maxLifetimeSeconds\": 86400}", 86400, false)]
        [InlineData("{\"maxLifetimeSeconds\": 86400}", 86401, true)]
        public void RefreshTokenLifetimeIsReportedOnlyAboveTheLimit(string configuration, int lifetime, bool isReported)
        {
            var issues = new ClientRefreshTokenLifetimeTooLongRule()
                .Validate(ClientWithLifetimes(refreshTokenLifetime: lifetime), configuration);

            issues.Should().HaveCount(isReported ? 1 : 0);
        }

        [Fact]
        public void RefreshTokenIssueCarriesBothLifetimes()
        {
            var issues = new ClientRefreshTokenLifetimeTooLongRule()
                .Validate(ClientWithLifetimes(refreshTokenLifetime: 90000), "{\"maxLifetimeSeconds\": 86400}");

            issues.Should().ContainSingle();
            issues[0].MessageParameters["maxLifetime"].Should().Be("86400");
            issues[0].MessageParameters["actualLifetime"].Should().Be("90000");
        }

        [Theory]
        [InlineData(null, 0, true)]
        [InlineData(null, 1, false)]
        [InlineData("{\"minScopes\": 2}", 1, true)]
        [InlineData("{\"minScopes\": 2}", 2, false)]
        [InlineData("{\"minScopes\": 0}", 0, false)]
        public void ClientIsReportedOnlyBelowTheMinimumNumberOfScopes(string configuration, int scopeCount, bool isReported)
        {
            var context = new ValidationContext { Clients = { RuleTestData.Client(scopes: Scopes(scopeCount)) } };

            var issues = new ClientMustHaveScopesRule().Validate(context, configuration);

            issues.Should().HaveCount(isReported ? 1 : 0);
        }

        [Fact]
        public void ClientScopeIssueCarriesBothCounts()
        {
            var context = new ValidationContext { Clients = { RuleTestData.Client(scopes: ["openid"]) } };

            var issues = new ClientMustHaveScopesRule().Validate(context, "{\"minScopes\": 3}");

            issues.Should().ContainSingle();
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.Client);
            issues[0].MessageParameters["actualCount"].Should().Be("1");
            issues[0].MessageParameters["requiredCount"].Should().Be("3");
        }

        [Theory]
        [InlineData(null, 0, true)]
        [InlineData(null, 1, false)]
        [InlineData("{\"minScopes\": 2}", 1, true)]
        [InlineData("{\"minScopes\": 2}", 2, false)]
        public void ApiResourceIsReportedOnlyBelowTheMinimumNumberOfScopes(string configuration, int scopeCount, bool isReported)
        {
            var context = new ValidationContext { ApiResources = { RuleTestData.ApiResource("orders", 1, Scopes(scopeCount)) } };

            var issues = new ApiResourceMustHaveScopesRule().Validate(context, configuration);

            issues.Should().HaveCount(isReported ? 1 : 0);
        }

        [Fact]
        public void ApiResourceScopeIssueIsReportedAgainstTheApiResource()
        {
            var context = new ValidationContext { ApiResources = { RuleTestData.ApiResource("orders", 7) } };

            var issues = new ApiResourceMustHaveScopesRule().Validate(context);

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(7);
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.ApiResource);
            issues[0].MessageParameters["resourceName"].Should().Be("orders");
            issues[0].MessageParameters["actualCount"].Should().Be("0");
        }
    }
}
