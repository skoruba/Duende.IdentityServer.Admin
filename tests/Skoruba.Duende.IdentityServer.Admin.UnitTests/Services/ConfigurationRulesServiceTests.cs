// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Services
{
    /// <summary>
    /// The configuration of a rule is free-form JSON, so the service is the only place
    /// that keeps a value the rule cannot work with from being saved.
    /// </summary>
    public class ConfigurationRulesServiceTests
    {
        private static ConfigurationRulesService CreateService()
        {
            var repository = new Mock<IConfigurationRulesRepository>();
            repository.Setup(x => x.AddRuleAsync(It.IsAny<ConfigurationRule>()))
                .ReturnsAsync((ConfigurationRule rule) => rule);

            return new ConfigurationRulesService(repository.Object, new ConfigurationRuleMetadataProvider());
        }

        private static Task<int> AddAsync(ConfigurationRuleType ruleType, string configuration)
        {
            return CreateService().AddRuleAsync(new ConfigurationRuleDto
            {
                RuleType = ruleType,
                Configuration = configuration
            });
        }

        [Theory]
        [InlineData(ConfigurationRuleType.ClientIdMustStartWith, "{\"prefixes\": [\"app_\", \"svc_\"]}")]
        [InlineData(ConfigurationRuleType.ClientIdMustNotContain, "{\"forbiddenStrings\": [\"test\"]}")]
        [InlineData(ConfigurationRuleType.ClientSigningAlgorithmsMustBeFapiCompliant, "{\"allowedAlgorithms\": [\"PS256\", \"ES256\"]}")]
        public async Task ArrayOfNamesIsAccepted(ConfigurationRuleType ruleType, string configuration)
        {
            await FluentActions.Awaiting(() => AddAsync(ruleType, configuration)).Should().NotThrowAsync();
        }

        [Theory]
        // An empty entry matches every name
        [InlineData(ConfigurationRuleType.ClientIdMustNotContain, "{\"forbiddenStrings\": [\"\"]}")]
        [InlineData(ConfigurationRuleType.ClientIdMustNotContain, "{\"forbiddenStrings\": [\"test\", \"  \"]}")]
        // A null entry makes the comparison throw
        [InlineData(ConfigurationRuleType.ClientIdMustStartWith, "{\"prefixes\": [null]}")]
        // Anything but a string fails the deserialization and the rule silently runs on its defaults
        [InlineData(ConfigurationRuleType.ClientSigningAlgorithmsMustBeFapiCompliant, "{\"allowedAlgorithms\": [1]}")]
        public async Task ArrayWithAnUnusableEntryIsRejected(ConfigurationRuleType ruleType, string configuration)
        {
            (await FluentActions.Awaiting(() => AddAsync(ruleType, configuration))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage("*non-empty strings*");
        }

        [Fact]
        public async Task RequiredArrayCannotBeEmpty()
        {
            (await FluentActions.Awaiting(() => AddAsync(ConfigurationRuleType.ClientIdMustStartWith, "{\"prefixes\": []}"))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage("*empty array*");
        }
    }
}
