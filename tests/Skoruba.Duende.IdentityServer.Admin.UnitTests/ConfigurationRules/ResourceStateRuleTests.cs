// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.ApiScopeRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.IdentityResourceRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// Covers the two rules that look at a single property of a resource: the display
    /// name of an API scope and the enabled flag of a required identity resource.
    /// </summary>
    public class ResourceStateRuleTests
    {
        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        public void ApiScopeWithoutADisplayNameIsReported(string displayName)
        {
            var context = new ValidationContext { ApiScopes = { RuleTestData.ApiScope("orders.read", displayName, id: 5) } };

            var issues = new ApiScopeMustHaveDisplayNameRule().Validate(context);

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(5);
            issues[0].ResourceName.Should().Be("orders.read");
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.ApiScope);
        }

        [Fact]
        public void ApiScopeWithADisplayNameIsNotReported()
        {
            var context = new ValidationContext { ApiScopes = { RuleTestData.ApiScope("orders.read", "Read orders") } };

            new ApiScopeMustHaveDisplayNameRule().Validate(context).Should().BeEmpty();
        }

        [Theory]
        [InlineData("openid")]
        [InlineData("profile")]
        public void DisabledRequiredIdentityResourceIsReported(string name)
        {
            var context = new ValidationContext
            {
                IdentityResources = { RuleTestData.IdentityResource(name, enabled: false, displayName: "Shown name", id: 3) }
            };

            var issues = new IdentityResourceMustBeEnabledRule().Validate(context);

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(3);
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.IdentityResource);
            issues[0].MessageParameters["resourceName"].Should().Be(name);
            issues[0].MessageParameters["displayName"].Should().Be("Shown name");
        }

        [Fact]
        public void EnabledRequiredIdentityResourceIsNotReported()
        {
            var context = new ValidationContext { IdentityResources = { RuleTestData.IdentityResource("openid") } };

            new IdentityResourceMustBeEnabledRule().Validate(context).Should().BeEmpty();
        }

        [Fact]
        public void DisabledIdentityResourceThatIsNotRequiredIsNotReported()
        {
            var context = new ValidationContext { IdentityResources = { RuleTestData.IdentityResource("email", enabled: false) } };

            new IdentityResourceMustBeEnabledRule().Validate(context).Should().BeEmpty();
        }

        [Fact]
        public void ConfiguredRequiredResourcesReplaceTheDefaultOnes()
        {
            var context = new ValidationContext
            {
                IdentityResources =
                {
                    RuleTestData.IdentityResource("openid", enabled: false, id: 1),
                    RuleTestData.IdentityResource("email", enabled: false, id: 2)
                }
            };

            var issues = new IdentityResourceMustBeEnabledRule().Validate(context, "{\"requiredResources\": [\"email\"]}");

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(2);
        }

        [Fact]
        public void MissingRequiredIdentityResourceIsNotThisRulesConcern()
        {
            // The rule reports a required resource that is switched off, not one that
            // was never created.
            new IdentityResourceMustBeEnabledRule().Validate(new ValidationContext()).Should().BeEmpty();
        }
    }
}
