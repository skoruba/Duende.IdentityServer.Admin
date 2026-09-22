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
    /// Covers the rules that judge a client by its grant types: the two obsolete
    /// grants and the authorization code flow without PKCE.
    /// </summary>
    public class ClientGrantTypeRuleTests
    {
        private static ValidationContext CreateContext(bool requirePkce, params string[] grantTypes)
        {
            var client = RuleTestData.Client(grantTypes: grantTypes);
            client.RequirePkce = requirePkce;

            return new ValidationContext { Clients = { client } };
        }

        [Fact]
        public void ImplicitGrantIsReportedEvenNextToOtherGrants()
        {
            var issues = new ObsoleteImplicitGrantRule()
                .Validate(CreateContext(true, "authorization_code", "implicit"), issueType: ConfigurationIssueTypeView.Error);

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(1);
            issues[0].ResourceName.Should().NotBeNullOrEmpty();
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.Client);
            issues[0].IssueType.Should().Be(ConfigurationIssueTypeView.Error);
        }

        [Fact]
        public void PasswordGrantIsReportedEvenNextToOtherGrants()
        {
            var issues = new ObsoletePasswordGrantRule().Validate(CreateContext(true, "client_credentials", "password"));

            issues.Should().ContainSingle();
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.Client);
        }

        [Theory]
        [InlineData("authorization_code")]
        [InlineData("client_credentials")]
        [InlineData("hybrid")]
        [InlineData("urn:ietf:params:oauth:grant-type:device_code")]
        public void CurrentGrantsAreNotObsolete(string grantType)
        {
            var context = CreateContext(true, grantType);

            new ObsoleteImplicitGrantRule().Validate(context).Should().BeEmpty();
            new ObsoletePasswordGrantRule().Validate(context).Should().BeEmpty();
        }

        [Fact]
        public void EachObsoleteGrantIsReportedByItsOwnRuleOnly()
        {
            new ObsoleteImplicitGrantRule().Validate(CreateContext(true, "password")).Should().BeEmpty();
            new ObsoletePasswordGrantRule().Validate(CreateContext(true, "implicit")).Should().BeEmpty();
        }

        [Fact]
        public void ClientWithoutGrantTypesIsNotReported()
        {
            var context = CreateContext(false);

            new ObsoleteImplicitGrantRule().Validate(context).Should().BeEmpty();
            new ObsoletePasswordGrantRule().Validate(context).Should().BeEmpty();
            new MissingPkceRule().Validate(context).Should().BeEmpty();
        }

        [Fact]
        public void AuthorizationCodeWithoutPkceIsReported()
        {
            var issues = new MissingPkceRule().Validate(CreateContext(false, "authorization_code"));

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(1);
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.Client);
        }

        [Fact]
        public void AuthorizationCodeWithPkceIsNotReported()
        {
            new MissingPkceRule().Validate(CreateContext(true, "authorization_code")).Should().BeEmpty();
        }

        [Theory]
        [InlineData("client_credentials")]
        [InlineData("urn:ietf:params:oauth:grant-type:device_code")]
        public void PkceIsNotExpectedFromFlowsWithoutAnAuthorizationCode(string grantType)
        {
            new MissingPkceRule().Validate(CreateContext(false, grantType)).Should().BeEmpty();
        }
    }
}
