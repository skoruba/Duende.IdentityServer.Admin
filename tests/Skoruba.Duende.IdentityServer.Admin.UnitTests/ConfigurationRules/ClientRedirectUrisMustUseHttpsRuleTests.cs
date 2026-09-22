// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ClientRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    public class ClientRedirectUrisMustUseHttpsRuleTests
    {
        private const string LocalhostNotAllowed = "{\"allowLocalhost\": false}";

        private static ValidationContext CreateContext(params string[] redirectUris)
            => new() { Clients = { RuleTestData.Client(redirectUris: redirectUris) } };

        [Theory]
        [InlineData("https://app.example.com/signin-oidc")]
        [InlineData("HTTPS://app.example.com/signin-oidc")]
        // Native apps redirect to a custom scheme - only plain http is the problem.
        [InlineData("com.example.app:/callback")]
        public void RedirectUriThatIsNotPlainHttpIsNotReported(string redirectUri)
        {
            new ClientRedirectUrisMustUseHttpsRule().Validate(CreateContext(redirectUri), LocalhostNotAllowed)
                .Should().BeEmpty();
        }

        [Theory]
        [InlineData("http://app.example.com/signin-oidc")]
        [InlineData("HTTP://app.example.com/signin-oidc")]
        public void PlainHttpRedirectUriIsReported(string redirectUri)
        {
            var issues = new ClientRedirectUrisMustUseHttpsRule().Validate(CreateContext(redirectUri));

            issues.Should().ContainSingle();
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.Client);
            issues[0].MessageParameters["uris"].Should().Be(redirectUri);
        }

        [Theory]
        [InlineData("http://localhost:5000/signin-oidc")]
        [InlineData("http://127.0.0.1:5000/signin-oidc")]
        public void LoopbackOverHttpIsAllowedUnlessConfiguredOtherwise(string redirectUri)
        {
            var rule = new ClientRedirectUrisMustUseHttpsRule();

            rule.Validate(CreateContext(redirectUri)).Should().BeEmpty();
            rule.Validate(CreateContext(redirectUri), "{\"allowLocalhost\": true}").Should().BeEmpty();
            rule.Validate(CreateContext(redirectUri), LocalhostNotAllowed).Should().ContainSingle();
        }

        [Fact]
        public void OnlyTheOffendingUrisAreListedInOneIssue()
        {
            var issues = new ClientRedirectUrisMustUseHttpsRule().Validate(CreateContext(
                "https://app.example.com/signin-oidc",
                "http://app.example.com/signin-oidc",
                "http://other.example.com/callback"));

            issues.Should().ContainSingle();
            issues[0].MessageParameters["count"].Should().Be("2");
            issues[0].MessageParameters["uris"].Should()
                .Be("http://app.example.com/signin-oidc, http://other.example.com/callback");
        }

        [Fact]
        public void ClientWithoutRedirectUrisIsNotReported()
        {
            new ClientRedirectUrisMustUseHttpsRule().Validate(CreateContext()).Should().BeEmpty();
        }

        [Fact]
        public void RedirectUriWithoutAValueIsSkippedInsteadOfFailingTheRule()
        {
            new ClientRedirectUrisMustUseHttpsRule().Validate(CreateContext([null])).Should().BeEmpty();
        }
    }
}
