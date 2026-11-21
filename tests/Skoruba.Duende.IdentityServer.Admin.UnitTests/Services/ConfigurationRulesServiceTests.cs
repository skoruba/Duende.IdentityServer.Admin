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
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules;
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

            return new ConfigurationRulesService(repository.Object, BuiltInRules.MetadataProvider);
        }

        private static Task<int> AddAsync(string ruleType, string configuration)
        {
            return CreateService().AddRuleAsync(new ConfigurationRuleDto
            {
                RuleType = ruleType,
                Configuration = configuration
            });
        }

        [Theory]
        [InlineData(ConfigurationRuleKeys.ClientIdMustStartWith, "{\"prefixes\": [\"app_\", \"svc_\"]}")]
        [InlineData(ConfigurationRuleKeys.ClientIdMustNotContain, "{\"forbiddenStrings\": [\"test\"]}")]
        [InlineData(ConfigurationRuleKeys.ClientSigningAlgorithmsMustBeFapiCompliant, "{\"allowedAlgorithms\": [\"PS256\", \"ES256\"]}")]
        public async Task ArrayOfNamesIsAccepted(string ruleType, string configuration)
        {
            await FluentActions.Awaiting(() => AddAsync(ruleType, configuration)).Should().NotThrowAsync();
        }

        [Theory]
        // An empty entry matches every name
        [InlineData(ConfigurationRuleKeys.ClientIdMustNotContain, "{\"forbiddenStrings\": [\"\"]}")]
        [InlineData(ConfigurationRuleKeys.ClientIdMustNotContain, "{\"forbiddenStrings\": [\"test\", \"  \"]}")]
        // A null entry makes the comparison throw
        [InlineData(ConfigurationRuleKeys.ClientIdMustStartWith, "{\"prefixes\": [null]}")]
        // Anything but a string fails the deserialization and the rule silently runs on its defaults
        [InlineData(ConfigurationRuleKeys.ClientSigningAlgorithmsMustBeFapiCompliant, "{\"allowedAlgorithms\": [1]}")]
        public async Task ArrayWithAnUnusableEntryIsRejected(string ruleType, string configuration)
        {
            (await FluentActions.Awaiting(() => AddAsync(ruleType, configuration))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage("*non-empty strings*");
        }

        [Fact]
        public async Task RuleTypeNoRuleIsRegisteredUnderIsRejected()
        {
            // The row would never be picked up by a validator and the UI could not describe it.
            (await FluentActions.Awaiting(() => AddAsync("Contoso.NotRegistered", null))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage("*Contoso.NotRegistered*not registered*");
        }

        [Theory]
        // Both would fail the deserialization of the rule and leave all its parameters on the defaults
        [InlineData("{\"minScopes\": 1.5}")]
        [InlineData("{\"minScopes\": 3000000000}")]
        public async Task NumberThatIsNotAWholeNumberIsRejected(string configuration)
        {
            (await FluentActions.Awaiting(() => AddAsync(ConfigurationRuleKeys.ClientMustHaveScopes, configuration))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage("*minScopes*whole number*");
        }

        [Fact]
        public async Task RequiredArrayCannotBeEmpty()
        {
            (await FluentActions.Awaiting(() => AddAsync(ConfigurationRuleKeys.ClientIdMustStartWith, "{\"prefixes\": []}"))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage("*empty array*");
        }

        private static readonly ConfigurationRule StoredRule = new() { Id = 5, RuleType = ConfigurationRuleKeys.ClientMustHaveScopes };

        private static Mock<IConfigurationRulesRepository> RepositoryWithStoredRule()
        {
            var repository = new Mock<IConfigurationRulesRepository>();
            repository.Setup(x => x.GetRuleByIdAsync(StoredRule.Id)).ReturnsAsync(StoredRule);
            repository.Setup(x => x.UpdateRuleAsync(It.IsAny<ConfigurationRule>())).ReturnsAsync(1);
            return repository;
        }

        private static Task<int> UpdateAsync(Mock<IConfigurationRulesRepository> repository, string ruleType, string configuration)
        {
            return new ConfigurationRulesService(repository.Object, BuiltInRules.MetadataProvider).UpdateRuleAsync(new ConfigurationRuleDto
            {
                Id = StoredRule.Id,
                RuleType = ruleType,
                Configuration = configuration
            });
        }

        [Fact]
        public async Task UpdateKeepsTheKeyAndSavesTheSettings()
        {
            var repository = RepositoryWithStoredRule();

            (await UpdateAsync(repository, ConfigurationRuleKeys.ClientMustHaveScopes, "{\"minScopes\": 2}")).Should().Be(1);

            repository.Verify(x => x.UpdateRuleAsync(It.Is<ConfigurationRule>(rule => rule.Configuration == "{\"minScopes\": 2}")), Times.Once);
        }

        [Fact]
        public async Task UpdateChecksTheConfigurationAgainstTheStoredRule()
        {
            (await FluentActions.Awaiting(() => UpdateAsync(RepositoryWithStoredRule(), ConfigurationRuleKeys.ClientMustHaveScopes, "{\"minScopes\": \"two\"}"))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage("*minScopes*must be a number*");
        }

        [Fact]
        public async Task UpdateWithAnotherKeyIsRefused()
        {
            // The configuration is valid for the requested rule, but the stored row stays a ClientMustHaveScopes rule.
            var repository = RepositoryWithStoredRule();

            (await FluentActions.Awaiting(() => UpdateAsync(repository, ConfigurationRuleKeys.ClientIdMustStartWith, "{\"prefixes\": [\"app_\"]}"))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage($"*cannot be changed from '{ConfigurationRuleKeys.ClientMustHaveScopes}' to '{ConfigurationRuleKeys.ClientIdMustStartWith}'*");

            repository.Verify(x => x.UpdateRuleAsync(It.IsAny<ConfigurationRule>()), Times.Never);
        }

        private static readonly ConfigurationRule UnknownRule = new() { Id = 6, RuleType = "1000", IsEnabled = true, Configuration = "{\"maxDays\": 90}" };

        private static Mock<IConfigurationRulesRepository> RepositoryWithUnknownRule()
        {
            var repository = new Mock<IConfigurationRulesRepository>();
            repository.Setup(x => x.GetRuleByIdAsync(UnknownRule.Id)).ReturnsAsync(UnknownRule);
            repository.Setup(x => x.UpdateRuleAsync(It.IsAny<ConfigurationRule>())).ReturnsAsync(1);
            return repository;
        }

        [Fact]
        public async Task UpdateOfARuleNoRegisteredRuleDescribesIsRefused()
        {
            // The Admin UI has no form for its parameters, so the update would arrive without the configuration.
            var repository = RepositoryWithUnknownRule();
            var service = new ConfigurationRulesService(repository.Object, BuiltInRules.MetadataProvider);

            (await FluentActions.Awaiting(() => service.UpdateRuleAsync(new ConfigurationRuleDto { Id = UnknownRule.Id, RuleType = UnknownRule.RuleType }))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage("*'1000' is not registered*");

            repository.Verify(x => x.UpdateRuleAsync(It.IsAny<ConfigurationRule>()), Times.Never);
        }

        [Fact]
        public async Task RuleNoRegisteredRuleDescribesCanBeToggledWithItsConfiguration()
        {
            var repository = RepositoryWithUnknownRule();
            var service = new ConfigurationRulesService(repository.Object, BuiltInRules.MetadataProvider);

            (await service.ToggleRuleAsync(UnknownRule.Id)).Should().BeTrue();

            repository.Verify(x => x.UpdateRuleAsync(It.Is<ConfigurationRule>(rule =>
                !rule.IsEnabled && rule.Configuration == "{\"maxDays\": 90}")), Times.Once);
        }

        [Fact]
        public async Task RuleNoRegisteredRuleDescribesCannotBeEnabled()
        {
            // The validation skips it, so the list would show a check as enabled that never runs.
            var repository = new Mock<IConfigurationRulesRepository>();
            repository.Setup(x => x.GetRuleByIdAsync(7)).ReturnsAsync(new ConfigurationRule { Id = 7, RuleType = "1000", IsEnabled = false });
            var service = new ConfigurationRulesService(repository.Object, BuiltInRules.MetadataProvider);

            (await FluentActions.Awaiting(() => service.ToggleRuleAsync(7))
                    .Should().ThrowAsync<InvalidOperationException>())
                .WithMessage("*'1000' is not registered*enable*");

            repository.Verify(x => x.UpdateRuleAsync(It.IsAny<ConfigurationRule>()), Times.Never);
        }

        [Fact]
        public async Task UpdateOfAMissingRuleChangesNothing()
        {
            var repository = RepositoryWithStoredRule();

            var result = await new ConfigurationRulesService(repository.Object, BuiltInRules.MetadataProvider)
                .UpdateRuleAsync(new ConfigurationRuleDto { Id = 404, RuleType = ConfigurationRuleKeys.ClientMustHaveScopes });

            result.Should().Be(0);
            repository.Verify(x => x.UpdateRuleAsync(It.IsAny<ConfigurationRule>()), Times.Never);
        }
    }
}
