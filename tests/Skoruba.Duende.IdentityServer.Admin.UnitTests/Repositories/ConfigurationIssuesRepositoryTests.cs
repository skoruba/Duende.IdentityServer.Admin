// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Options;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Repositories
{
    public class ConfigurationIssuesRepositoryTests
    {
        private sealed class RecordingLogger<T> : ILogger<T>
        {
            public List<LogLevel> Levels { get; } = new();

            public IDisposable BeginScope<TState>(TState state) where TState : notnull => null;

            public bool IsEnabled(LogLevel logLevel) => true;

            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
                => Levels.Add(logLevel);
        }

        private static IdentityServerConfigurationDbContext GetConfigurationDbContext()
        {
            var services = new ServiceCollection();
            services.AddSingleton(new ConfigurationStoreOptions());
            services.AddDbContext<IdentityServerConfigurationDbContext>(builder => builder.UseInMemoryDatabase(Guid.NewGuid().ToString()));

            return services.BuildServiceProvider().GetRequiredService<IdentityServerConfigurationDbContext>();
        }

        private static async Task<AdminConfigurationDbContext> GetRulesDbContextAsync(params string[] enabledRuleTypes)
        {
            var options = new DbContextOptionsBuilder<AdminConfigurationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            var context = new AdminConfigurationDbContext(options);

            // The model seeds the built-in rules; only the rules of the test are enabled
            await context.Database.EnsureCreatedAsync();
            foreach (var rule in context.ConfigurationRules)
            {
                rule.IsEnabled = false;
            }

            foreach (var ruleType in enabledRuleTypes)
            {
                context.ConfigurationRules.Add(new ConfigurationRule { RuleType = ruleType, IsEnabled = true, ResourceType = ConfigurationResourceType.Client });
            }

            await context.SaveChangesAsync();

            return context;
        }

        [Fact]
        public async Task GetAllIssuesAsyncSkipsAStoredRuleThatIsNotRegisteredWithoutAnError()
        {
            var issue = new ConfigurationIssueView { Message = "registered rule issue" };
            var registeredValidator = new Mock<IConfigurationRuleValidator>();
            registeredValidator
                .Setup(x => x.ValidateWithContext(It.IsAny<ValidationContext>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<ConfigurationIssueTypeView>()))
                .Returns(new List<ConfigurationIssueView> { issue });
            var failingValidator = new Mock<IConfigurationRuleValidator>();
            failingValidator
                .Setup(x => x.ValidateWithContext(It.IsAny<ValidationContext>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<ConfigurationIssueTypeView>()))
                .Throws(new InvalidOperationException("Boom"));

            var factory = new Mock<IConfigurationRuleValidatorFactory>();
            factory.Setup(x => x.Create("Contoso.Registered")).Returns(registeredValidator.Object);
            factory.Setup(x => x.Create("Contoso.Failing")).Returns(failingValidator.Object);
            factory.Setup(x => x.Create("Contoso.Removed")).Throws(new NotSupportedException("not registered"));

            var logger = new RecordingLogger<ConfigurationIssuesRepository<IdentityServerConfigurationDbContext, AdminConfigurationDbContext>>();
            var repository = new ConfigurationIssuesRepository<IdentityServerConfigurationDbContext, AdminConfigurationDbContext>(
                GetConfigurationDbContext(),
                await GetRulesDbContextAsync("Contoso.Removed", "Contoso.Registered", "Contoso.Failing"),
                factory.Object,
                logger);

            var issues = await repository.GetAllIssuesAsync();

            issues.Should().ContainSingle().Which.Should().BeSameAs(issue);
            logger.Levels.Should().ContainSingle(x => x == LogLevel.Error, "only the rule that failed while validating is an error");
        }
    }
}
