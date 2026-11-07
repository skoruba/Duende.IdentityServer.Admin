// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using Duende.IdentityServer.EntityFramework.Entities;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.ConfigurationRules
{
    public class ClientSecretMustExpireWithinOneYearRuleTests
    {
        private static List<ConfigurationIssueView> Run(string configuration, params DateTime?[] expirations)
        {
            var client = new Client { Id = 7, ClientId = "shop", ClientName = "Shop", ClientSecrets = new List<ClientSecret>() };
            foreach (var expiration in expirations)
            {
                client.ClientSecrets.Add(new ClientSecret { Expiration = expiration });
            }

            var rule = new ClientSecretMustExpireWithinOneYearRule();

            return rule.ValidateWithContext(new ValidationContext { Clients = { client } }, configuration,
                rule.DefaultMessageTemplate, rule.DefaultFixDescription, ConfigurationIssueTypeView.Warning);
        }

        [Fact]
        public void SecretWithoutExpirationOrBeyondTheLimitIsReported()
        {
            var inTwoYears = DateTime.UtcNow.AddYears(2);

            var issues = Run(null, null, inTwoYears, DateTime.UtcNow.AddDays(30));

            issues.Should().HaveCount(2);
            issues.Should().OnlyContain(issue => issue.ResourceId == 7 && issue.ResourceType == ConfigurationResourceType.Client);
            issues[0].Message.Should().Be("Client 'Shop' has a secret that expires never, the limit is 365 days");
            issues[1].Message.Should().Be($"Client 'Shop' has a secret that expires {inTwoYears:yyyy-MM-dd}, the limit is 365 days");
            issues[1].FixDescription.Should().Be("Set the expiration of the secret to at most 365 days from now.");
        }

        [Fact]
        public void LimitComesFromTheConfiguration()
        {
            Run("{\"maxDays\": 10}", DateTime.UtcNow.AddDays(30)).Should().ContainSingle()
                .Which.MessageParameters.Should().Contain("maxDays", "10");
        }
    }
}
