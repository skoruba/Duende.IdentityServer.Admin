// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Extensions;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.Helpers;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// The seed gives every registered rule a row, so a rule added in code shows up in the
    /// list right after the deployment, switched off until an administrator configures it.
    /// </summary>
    public class ConfigurationRulesSeedTests
    {
        /// <summary>
        /// Stands for a second instance that starts at the same time and saves the same rows first.
        /// </summary>
        private sealed class ConcurrentInstanceInterceptor : SaveChangesInterceptor
        {
            private readonly Func<Task> _otherInstanceSaves;

            public ConcurrentInstanceInterceptor(Func<Task> otherInstanceSaves)
            {
                _otherInstanceSaves = otherInstanceSaves;
            }

            public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData,
                InterceptionResult<int> result, CancellationToken cancellationToken = default)
            {
                await _otherInstanceSaves();
                throw new DbUpdateException("Cannot insert duplicate key row in object 'dbo.ConfigurationRules'.");
            }
        }

        private static DbContextOptions<AdminConfigurationDbContext> Options(InMemoryDatabaseRoot root, string name,
            IInterceptor interceptor = null)
        {
            var builder = new DbContextOptionsBuilder<AdminConfigurationDbContext>().UseInMemoryDatabase(name, root);
            if (interceptor != null)
            {
                builder.AddInterceptors(interceptor);
            }

            return builder.Options;
        }

        private static async Task<(InMemoryDatabaseRoot Root, string Name)> CreateDatabaseWithoutAsync(string ruleType)
        {
            var root = new InMemoryDatabaseRoot();
            var name = Guid.NewGuid().ToString();

            // The model seeds the built-in rules; one of them is missing, as if an administrator deleted it
            await using var context = new AdminConfigurationDbContext(Options(root, name));
            await context.Database.EnsureCreatedAsync();
            context.ConfigurationRules.Remove(await context.ConfigurationRules.SingleAsync(x => x.RuleType == ruleType));
            await context.SaveChangesAsync();

            return (root, name);
        }

        private static IServiceProvider Services(DbContextOptions<AdminConfigurationDbContext> options)
        {
            var services = new ServiceCollection();
            services
                .AddBuiltInConfigurationRules()
                .AddConfigurationRule<ConfigurationRuleRegistryTests.SecretMustExpireRule>();
            services.AddScoped(_ => new AdminConfigurationDbContext(options));

            return services.BuildServiceProvider(validateScopes: true);
        }

        private static async Task<ConfigurationRule[]> StoredRulesAsync(InMemoryDatabaseRoot root, string name)
        {
            await using var context = new AdminConfigurationDbContext(Options(root, name));
            return await context.ConfigurationRules.AsNoTracking().ToArrayAsync();
        }

        [Fact]
        public async Task AddsADisabledRowForEveryRegisteredRuleWithoutOne()
        {
            var (root, name) = await CreateDatabaseWithoutAsync(ConfigurationRuleKeys.MissingPkce);

            var added = await DbMigrationHelpers.EnsureConfigurationRulesSeededAsync<AdminConfigurationDbContext>(
                Services(Options(root, name)));

            added.Should().Be(2);
            var stored = await StoredRulesAsync(root, name);
            stored.Select(x => x.RuleType).Should().OnlyHaveUniqueItems()
                .And.HaveCount(ConfigurationRuleKeys.BuiltIn.Count + 1);

            var custom = stored.Single(x => x.RuleType == ConfigurationRuleRegistryTests.SecretMustExpireRule.RuleKey);
            custom.IsEnabled.Should().BeFalse();
            custom.MessageTemplate.Should().NotBeNullOrEmpty();
            stored.Single(x => x.RuleType == ConfigurationRuleKeys.MissingPkce).IsEnabled.Should().BeFalse();
        }

        [Fact]
        public async Task LeavesExistingRowsAlone()
        {
            var (root, name) = await CreateDatabaseWithoutAsync(ConfigurationRuleKeys.MissingPkce);
            var services = Services(Options(root, name));
            await DbMigrationHelpers.EnsureConfigurationRulesSeededAsync<AdminConfigurationDbContext>(services);

            await using (var context = new AdminConfigurationDbContext(Options(root, name)))
            {
                var custom = await context.ConfigurationRules
                    .SingleAsync(x => x.RuleType == ConfigurationRuleRegistryTests.SecretMustExpireRule.RuleKey);
                custom.IsEnabled = true;
                custom.MessageTemplate = "Configured by an administrator";
                await context.SaveChangesAsync();
            }

            var added = await DbMigrationHelpers.EnsureConfigurationRulesSeededAsync<AdminConfigurationDbContext>(services);

            added.Should().Be(0);
            var stored = (await StoredRulesAsync(root, name))
                .Single(x => x.RuleType == ConfigurationRuleRegistryTests.SecretMustExpireRule.RuleKey);
            stored.IsEnabled.Should().BeTrue();
            stored.MessageTemplate.Should().Be("Configured by an administrator");
        }

        [Fact]
        public async Task AnotherInstanceSavingTheRowsFirstIsNotAnError()
        {
            var (root, name) = await CreateDatabaseWithoutAsync(ConfigurationRuleKeys.MissingPkce);
            var interceptor = new ConcurrentInstanceInterceptor(() =>
                DbMigrationHelpers.EnsureConfigurationRulesSeededAsync<AdminConfigurationDbContext>(Services(Options(root, name))));

            var added = await DbMigrationHelpers.EnsureConfigurationRulesSeededAsync<AdminConfigurationDbContext>(
                Services(Options(root, name, interceptor)));

            added.Should().Be(0);
            (await StoredRulesAsync(root, name)).Select(x => x.RuleType).Should().OnlyHaveUniqueItems()
                .And.HaveCount(ConfigurationRuleKeys.BuiltIn.Count + 1);
        }

        [Fact]
        public async Task AFailureThatLeavesRulesWithoutARowIsRethrown()
        {
            var (root, name) = await CreateDatabaseWithoutAsync(ConfigurationRuleKeys.MissingPkce);
            var interceptor = new ConcurrentInstanceInterceptor(() => Task.CompletedTask);

            var seed = () => DbMigrationHelpers.EnsureConfigurationRulesSeededAsync<AdminConfigurationDbContext>(
                Services(Options(root, name, interceptor)));

            await seed.Should().ThrowAsync<DbUpdateException>();
        }
    }
}
