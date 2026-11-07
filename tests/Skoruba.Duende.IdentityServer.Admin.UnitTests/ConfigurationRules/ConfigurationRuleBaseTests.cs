// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Duende.IdentityServer.EntityFramework.Entities;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// What a custom rule gets from the typed base: its configuration bound, and every
    /// issue carrying the texts and the severity the administrator configured.
    /// </summary>
    public class ConfigurationRuleBaseTests
    {
        private static readonly DateTime Now = new(2030, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        private static ValidationContext ContextWith(params ClientSecret[] secrets)
            => new() { Clients = { RuleTestData.Client(clientId: "shop", clientName: "Shop", id: 7, secrets: secrets) } };

        private static List<ConfigurationIssueView> Run(ValidationContext context, string configuration, ConfigurationIssueTypeView issueType = ConfigurationIssueTypeView.Warning)
            => new ConfigurationRuleRegistryTests.SecretMustExpireRule(new ConfigurationRuleRegistryTests.Clock(Now))
                .ValidateWithContext(context, configuration, "{clientName}: {expiration} > {maxDays}", "Fix within {maxDays} days", issueType);

        [Fact]
        public void IssueCarriesTheConfiguredTextsAndSeverity()
        {
            var issue = Run(ContextWith(new ClientSecret { Expiration = Now.AddYears(2) }), "{\"maxDays\": 30}").Should().ContainSingle().Subject;

            issue.ResourceId.Should().Be(7);
            issue.ResourceName.Should().Be("Shop");
            issue.ResourceType.Should().Be(ConfigurationResourceType.Client);
            issue.Message.Should().Be("Shop: 2032-01-01 > 30");
            issue.FixDescription.Should().Be("Fix within 30 days");
            issue.IssueType.Should().Be(ConfigurationIssueTypeView.Warning);
            issue.MessageParameters.Should().Contain("maxDays", "30");
        }

        [Fact]
        public void RuleMayRaiseTheSeverityOfOneIssue()
        {
            var issue = Run(ContextWith(new ClientSecret { Expiration = null }), null).Should().ContainSingle().Subject;

            issue.IssueType.Should().Be(ConfigurationIssueTypeView.Error);
            issue.Message.Should().Be("Shop: never > 365", "a missing configuration leaves the rule on its defaults");
        }

        [Fact]
        public void ClearedFixDescriptionLeavesTheIssueWithoutOne()
        {
            // The fix description is optional; the parameters still have to fill the message.
            var issue = new ConfigurationRuleRegistryTests.SecretMustExpireRule(new ConfigurationRuleRegistryTests.Clock(Now))
                .ValidateWithContext(ContextWith(new ClientSecret { Expiration = null }), null, "{clientName}: {maxDays}", null, ConfigurationIssueTypeView.Warning)
                .Should().ContainSingle().Subject;

            issue.Message.Should().Be("Shop: 365");
            issue.FixDescription.Should().BeNull();
        }

        [Fact]
        public void ConfigurationThatIsNotJsonFallsBackToTheDefaults()
        {
            Run(ContextWith(new ClientSecret { Expiration = Now.AddDays(100) }), "not json").Should().BeEmpty();
        }

        [Fact]
        public void NothingToReportGivesNoIssues()
        {
            Run(ContextWith(new ClientSecret { Expiration = Now.AddDays(10) }), "{\"maxDays\": 30}").Should().BeEmpty();
            Run(new ValidationContext(), null).Should().BeEmpty();
        }

        [Fact]
        public void IssueOutsideOfARunIsAProgrammingError()
        {
            var rule = new ConfigurationRuleRegistryTests.SecretMustExpireRule();

            var act = () => rule.IssueOutsideRun();

            act.Should().Throw<InvalidOperationException>();
        }
    }

    internal static class SecretMustExpireRuleTestExtensions
    {
        private sealed class Exposing : ConfigurationRuleRegistryTests.SecretMustExpireRule
        {
            public ConfigurationIssueView Expose() => Issue(1, "x", new Dictionary<string, string>());
        }

        public static ConfigurationIssueView IssueOutsideRun(this ConfigurationRuleRegistryTests.SecretMustExpireRule _) => new Exposing().Expose();
    }
}
