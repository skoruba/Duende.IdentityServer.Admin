// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using Duende.IdentityServer.EntityFramework.Entities;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules.SecurityRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// The rule reads the clock itself, so the expirations are relative to now and
    /// keep an hour of slack - a whole number of days would land on either side of
    /// the rule's own, slightly later, reading.
    /// </summary>
    public class SecretIsExpiredInDaysRuleTests
    {
        private static ClientSecret SecretExpiringIn(double days, string description = null, string type = null)
            => new() { Expiration = DateTime.UtcNow.AddDays(days).AddHours(1), Description = description, Type = type };

        private static ClientSecret SecretExpiredBefore(double days)
            => new() { Expiration = DateTime.UtcNow.AddDays(-days).AddHours(-1) };

        private static ValidationContext CreateContext(params ClientSecret[] secrets)
            => new() { Clients = { RuleTestData.Client(secrets: secrets) } };

        [Fact]
        public void SecretWithoutAnExpirationIsNotReported()
        {
            new SecretIsExpiredInDaysRule().Validate(CreateContext(new ClientSecret())).Should().BeEmpty();
        }

        [Theory]
        [InlineData(null, 10, true)]
        [InlineData(null, 60, false)]
        [InlineData("{\"warningDays\": 90}", 60, true)]
        [InlineData("{\"warningDays\": 5}", 10, false)]
        public void SecretIsReportedOnlyInsideTheWarningPeriod(string configuration, int expiresInDays, bool isReported)
        {
            var issues = new SecretIsExpiredInDaysRule()
                .Validate(CreateContext(SecretExpiringIn(expiresInDays)), configuration);

            issues.Should().HaveCount(isReported ? 1 : 0);
        }

        [Fact]
        public void ExpiringSecretIsDescribedInTheIssue()
        {
            var secret = SecretExpiringIn(10, description: "Production key", type: "JWK");

            var issues = new SecretIsExpiredInDaysRule().Validate(CreateContext(secret));

            issues.Should().ContainSingle();
            issues[0].ResourceId.Should().Be(1);
            issues[0].ResourceType.Should().Be(ConfigurationResourceType.Client);
            issues[0].MessageParameters["status"].Should().Be("EXPIRING");
            issues[0].MessageParameters["isExpired"].Should().Be("False");
            issues[0].MessageParameters["daysUntilExpiry"].Should().Be("10");
            issues[0].MessageParameters["secretType"].Should().Be("JWK");
            issues[0].MessageParameters["secretDescription"].Should().Be("Production key");
            issues[0].MessageParameters["clientId"].Should().Be("client_under_test");
            issues[0].MessageParameters["expirationDate"].Should().Be(secret.Expiration!.Value.ToString("yyyy-MM-dd HH:mm"));
        }

        [Fact]
        public void SecretWithoutATypeOrDescriptionGetsPlaceholders()
        {
            var issues = new SecretIsExpiredInDaysRule().Validate(CreateContext(SecretExpiringIn(10)));

            issues.Should().ContainSingle();
            issues[0].MessageParameters["secretType"].Should().Be("SharedSecret");
            issues[0].MessageParameters["secretDescription"].Should().Be("No description");
        }

        [Fact]
        public void ExpiredSecretIsReportedAsExpiredWithThePositiveNumberOfDays()
        {
            var issues = new SecretIsExpiredInDaysRule().Validate(CreateContext(SecretExpiredBefore(5)));

            issues.Should().ContainSingle();
            issues[0].MessageParameters["status"].Should().Be("EXPIRED");
            issues[0].MessageParameters["isExpired"].Should().Be("True");
            issues[0].MessageParameters["daysUntilExpiry"].Should().Be("5");
        }

        [Fact]
        public void SecretExpiredLessThanADayAgoIsAlreadyExpired()
        {
            var secret = new ClientSecret { Expiration = DateTime.UtcNow.AddHours(-12) };

            var issues = new SecretIsExpiredInDaysRule().Validate(CreateContext(secret));

            issues.Should().ContainSingle();
            issues[0].MessageParameters["status"].Should().Be("EXPIRED");
            issues[0].MessageParameters["isExpired"].Should().Be("True");
        }

        [Fact]
        public void ExpiredSecretsCanBeLeftOut()
        {
            var context = CreateContext(SecretExpiredBefore(5), SecretExpiringIn(10));

            var issues = new SecretIsExpiredInDaysRule().Validate(context, "{\"includeAlreadyExpired\": false}");

            issues.Should().ContainSingle();
            issues[0].MessageParameters["status"].Should().Be("EXPIRING");
        }

        [Fact]
        public void EverySecretGetsItsOwnIssueSoonestFirst()
        {
            var context = new ValidationContext
            {
                Clients =
                {
                    RuleTestData.Client(clientId: "first", id: 1, secrets: [SecretExpiringIn(20), SecretExpiredBefore(3)]),
                    RuleTestData.Client(clientId: "second", id: 2, secrets: [SecretExpiringIn(5)])
                }
            };

            var issues = new SecretIsExpiredInDaysRule().Validate(context);

            issues.Select(issue => (issue.ResourceId, issue.MessageParameters["daysUntilExpiry"]))
                .Should().Equal((1, "3"), (2, "5"), (1, "20"));
        }

        [Fact]
        public void ClientWithoutANameIsReportedUnderItsClientId()
        {
            var context = new ValidationContext
            {
                Clients = { RuleTestData.Client(clientId: "orders_client", clientName: null, secrets: [SecretExpiringIn(1)]) }
            };

            var issues = new SecretIsExpiredInDaysRule().Validate(context);

            issues.Should().ContainSingle();
            issues[0].MessageParameters["clientName"].Should().Be("orders_client");
        }
    }
}
