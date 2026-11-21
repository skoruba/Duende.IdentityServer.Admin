// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Extensions;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// A deployment registers its own rules next to the built-in ones. The registry is the
    /// only place that keeps a key from being stored that no rule could ever pick up.
    /// </summary>
    public class ConfigurationRuleRegistryTests
    {
        private static IServiceProvider Build(Action<IServiceCollection> configure)
        {
            var services = new ServiceCollection();
            configure(services);

            // Scopes are validated like in the Development environment of an ASP.NET Core host.
            return services.BuildServiceProvider(validateScopes: true);
        }

        private static IConfigurationRuleRegistry Registry(Action<IServiceCollection> configure)
            => Build(configure).GetRequiredService<IConfigurationRuleRegistry>();

        [Fact]
        public void CustomRuleIsRegisteredNextToTheBuiltInOnes()
        {
            var registry = Registry(services => services
                .AddBuiltInConfigurationRules()
                .AddConfigurationRule<SecretMustExpireRule>());

            var descriptor = registry.Find(SecretMustExpireRule.RuleKey);

            descriptor.Should().NotBeNull();
            descriptor.IsBuiltIn.Should().BeFalse();
            descriptor.ImplementationType.Should().Be<SecretMustExpireRule>();
            registry.Rules.Should().HaveCount(ConfigurationRuleKeys.BuiltIn.Count + 1);
            registry.Find(ConfigurationRuleKeys.MissingPkce).IsBuiltIn.Should().BeTrue();
        }

        [Fact]
        public void RegistrationOrderDoesNotMatter()
        {
            var registry = Registry(services => services
                .AddConfigurationRule<SecretMustExpireRule>()
                .AddBuiltInConfigurationRules());

            registry.Find(SecretMustExpireRule.RuleKey).Should().NotBeNull();
            registry.Find(ConfigurationRuleKeys.MissingPkce).Should().NotBeNull();
        }

        [Fact]
        public void RegisteringTheSameRuleTwiceKeepsOneDescriptor()
        {
            var registry = Registry(services => services
                .AddConfigurationRule<SecretMustExpireRule>()
                .AddConfigurationRule<SecretMustExpireRule>()
                .AddConfigurationRule(typeof(SecretMustExpireRule)));

            registry.Rules.Should().ContainSingle();
        }

        [Fact]
        public void CustomRuleShowsUpInTheMetadataTheUiLists()
        {
            var provider = Build(services => services
                .AddConfigurationRule<SecretMustExpireRule>()
                .AddSingleton<IConfigurationRuleMetadataProvider, ConfigurationRuleMetadataProvider>());

            var metadata = provider.GetRequiredService<IConfigurationRuleMetadataProvider>().GetMetadata(SecretMustExpireRule.RuleKey);

            metadata.RuleType.Should().Be(SecretMustExpireRule.RuleKey);
            metadata.DisplayName.Should().Be("Secret must expire");
            metadata.ResourceType.Should().Be(nameof(ConfigurationResourceType.Client));
            metadata.Parameters.Should().ContainSingle().Which.Type.Should().Be("number");
            metadata.Parameters.Single().DefaultValue.Should().Be(365);
        }

        [Fact]
        public void RulesAreListedByResourceTypeThenDisplayName()
        {
            var registry = Registry(services => services
                .AddBuiltInConfigurationRules()
                .AddConfigurationRule<SecretMustExpireRule>());

            var listed = registry.Rules.Select(descriptor => (descriptor.Metadata.ResourceType, descriptor.Metadata.DisplayName)).ToList();

            listed.Should().BeInAscendingOrder(Comparer<(ConfigurationResourceType ResourceType, string DisplayName)>.Create((left, right) =>
                left.ResourceType != right.ResourceType
                    ? left.ResourceType.CompareTo(right.ResourceType)
                    : string.Compare(left.DisplayName, right.DisplayName, StringComparison.OrdinalIgnoreCase)));
        }

        [Fact]
        public void FindReturnsNullForAnUnknownOrMissingKey()
        {
            var registry = Registry(services => services.AddBuiltInConfigurationRules());

            registry.Find("Contoso.Nope").Should().BeNull();
            registry.Find(null).Should().BeNull();
        }

        [Fact]
        public void KeysAreCaseSensitive()
        {
            var registry = Registry(services => services.AddBuiltInConfigurationRules());

            registry.Find("missingpkce").Should().BeNull();
        }

        [Fact]
        public void CustomKeyWithoutANamespaceIsRejectedAtStartup()
        {
            var act = () => Registry(services => services.AddConfigurationRule<UnnamespacedRule>());

            act.Should().Throw<InvalidOperationException>()
                .WithMessage($"*{typeof(UnnamespacedRule).FullName}*")
                .WithMessage("*namespaced*");
        }

        [Fact]
        public void BuiltInRulesCannotBeRegisteredAsCustom()
        {
            // A deployment that scans this project's assembly by mistake gets told so.
            var act = () => Registry(services => services.AddConfigurationRulesFromAssembly(typeof(ConfigurationRuleBase).Assembly));

            act.Should().Throw<InvalidOperationException>().WithMessage("*namespaced*");
        }

        [Theory]
        [InlineData("Contoso.Bad Key")]
        [InlineData("Contoso.")]
        [InlineData(".Rule")]
        [InlineData("Contoso..Rule")]
        [InlineData("Contoso.Rule/1")]
        public void MalformedKeyIsRejectedAtStartup(string key)
        {
            var act = () => Registry(services => services.AddSingleton(new ConfigurationRuleRegistration(typeof(KeyFromServiceRule), isBuiltIn: false))
                .AddSingleton(new RuleKey(key))
                .AddSingleton<IConfigurationRuleRegistry, ConfigurationRuleRegistry>());

            act.Should().Throw<InvalidOperationException>().WithMessage("*not valid*");
        }

        [Fact]
        public void KeyLongerThanTheColumnIsRejectedAtStartup()
        {
            ConfigurationRuleKeys.IsWellFormed("Contoso." + new string('a', ConfigurationRuleKeys.MaxLength)).Should().BeFalse();
            ConfigurationRuleKeys.IsWellFormed("Contoso." + new string('a', ConfigurationRuleKeys.MaxLength - 8)).Should().BeTrue();
        }

        [Fact]
        public void TwoRulesWithTheSameKeyAreRejectedAtStartup()
        {
            var act = () => Registry(services => services
                .AddConfigurationRule<SecretMustExpireRule>()
                .AddConfigurationRule<SecretMustExpireDuplicateRule>());

            act.Should().Throw<InvalidOperationException>()
                .WithMessage($"*{SecretMustExpireRule.RuleKey}*")
                .WithMessage($"*{typeof(SecretMustExpireDuplicateRule).FullName}*");
        }

        [Fact]
        public void ParameterWithoutANameIsRejectedAtStartup()
        {
            var act = () => Registry(services => services.AddConfigurationRule<UnnamedParameterRule>());

            act.Should().Throw<InvalidOperationException>().WithMessage("*parameter needs a name*");
        }

        [Fact]
        public void RuleTakesConstructorDependenciesFromTheContainer()
        {
            var provider = Build(services => services
                .AddSingleton(new Clock(new DateTime(2030, 1, 1, 0, 0, 0, DateTimeKind.Utc)))
                .AddConfigurationRule<SecretMustExpireRule>()
                .AddScoped<IConfigurationRuleValidatorFactory, ConfigurationRuleValidatorFactory>());
            using var scope = provider.CreateScope();

            var validator = scope.ServiceProvider.GetRequiredService<IConfigurationRuleValidatorFactory>().Create(SecretMustExpireRule.RuleKey);

            validator.Should().BeOfType<SecretMustExpireRule>().Which.Now.Year.Should().Be(2030);
        }

        [Fact]
        public void RuleMayDependOnAScopedService()
        {
            var log = new DisposalLog();
            var provider = Build(services => services
                .AddSingleton(log)
                .AddScoped<ScopedDependency>()
                .AddConfigurationRule<ScopedDependencyRule>()
                .AddSingleton<IConfigurationRuleMetadataProvider, ConfigurationRuleMetadataProvider>()
                .AddScoped<IConfigurationRuleValidatorFactory, ConfigurationRuleValidatorFactory>());

            var metadata = provider.GetRequiredService<IConfigurationRuleMetadataProvider>().GetMetadata(ScopedDependencyRule.ScopedRuleKey);

            // The dependency throws once disposed, so the metadata cannot have been read from the instance now.
            log.Disposed.Should().Be(1, "the scope the rule was described in ends with the registration");
            metadata.DisplayName.Should().Be(ScopedDependency.Name);

            using (var scope = provider.CreateScope())
            {
                scope.ServiceProvider.GetRequiredService<IConfigurationRuleValidatorFactory>().Create(ScopedDependencyRule.ScopedRuleKey)
                    .Should().BeOfType<ScopedDependencyRule>();
            }

            log.Disposed.Should().Be(2, "the instance of a validation run lives in the scope of the request");
        }

        [Fact]
        public async Task RuleThatCannotBeRegisteredStopsTheHostFromStarting()
        {
            using var host = new HostBuilder()
                .ConfigureServices(services => services.AddConfigurationRule<UnnamespacedRule>())
                .Build();

            var act = () => host.StartAsync();

            await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("*namespaced*");
        }

        [Fact]
        public void FactoryRefusesAKeyNoRuleIsRegisteredUnder()
        {
            var provider = Build(services => services
                .AddBuiltInConfigurationRules()
                .AddScoped<IConfigurationRuleValidatorFactory, ConfigurationRuleValidatorFactory>());
            using var scope = provider.CreateScope();

            var act = () => scope.ServiceProvider.GetRequiredService<IConfigurationRuleValidatorFactory>().Create("Contoso.Removed");

            act.Should().Throw<NotSupportedException>().WithMessage("*Contoso.Removed*");
        }

        [Fact]
        public void AssemblyScanPicksUpEveryConcreteRule()
        {
            var services = new ServiceCollection().AddConfigurationRulesFromAssemblyContaining<ConfigurationRuleRegistryTests>();

            var scanned = services
                .Where(descriptor => descriptor.ImplementationInstance is ConfigurationRuleRegistration)
                .Select(descriptor => ((ConfigurationRuleRegistration)descriptor.ImplementationInstance).ImplementationType)
                .ToList();

            scanned.Should().Contain(typeof(SecretMustExpireRule));
            scanned.Should().NotContain(type => type.IsAbstract);
            scanned.Should().OnlyContain(type => typeof(IConfigurationRule).IsAssignableFrom(type));
        }

        public sealed record Clock(DateTime UtcNow);

        /// <summary>The rule from issue #340, with an optional dependency to prove injection.</summary>
        public class SecretMustExpireRule : ConfigurationRuleBase<SecretMustExpireRule.Config>
        {
            public const string RuleKey = "Tests.SecretMustExpire";

            public SecretMustExpireRule(Clock clock = null)
            {
                Now = clock?.UtcNow ?? DateTime.UtcNow;
            }

            public DateTime Now { get; }

            public override string Key => RuleKey;
            public override ConfigurationResourceType ResourceType => ConfigurationResourceType.Client;
            public override string DisplayName => "Secret must expire";
            public override string Description => "Secrets have to expire within the configured number of days.";
            public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
            [
                ConfigurationRuleParameter.Number("maxDays", "Maximum days", "Days a secret may stay valid", defaultValue: 365, minValue: 1)
            ];
            public override string DefaultConfiguration => "{\"maxDays\": 365}";
            public override string DefaultMessageTemplate => "Secret of '{clientName}' expires {expiration}, limit is {maxDays} days";
            public override string DefaultFixDescription => "Set the expiration to at most {maxDays} days from now.";

            protected override IEnumerable<ConfigurationIssueView> Validate(ValidationContext context, Config configuration)
            {
                var maxDays = configuration.MaxDays ?? 365;
                var limit = Now.AddDays(maxDays);

                foreach (var client in context.Clients)
                foreach (var secret in client.ClientSecrets)
                {
                    if (secret.Expiration is { } expiration && expiration <= limit)
                    {
                        continue;
                    }

                    yield return Issue(client, new Dictionary<string, string>
                    {
                        ["clientName"] = GetDisplayName(client.ClientName, client.ClientId),
                        ["expiration"] = secret.Expiration?.ToString("yyyy-MM-dd") ?? "never",
                        ["maxDays"] = maxDays.ToString()
                    }, secret.Expiration == null ? ConfigurationIssueTypeView.Error : null);
                }
            }

            public class Config
            {
                public int? MaxDays { get; set; }
            }
        }

        private class SecretMustExpireDuplicateRule : SecretMustExpireRule
        {
        }

        private class UnnamespacedRule : SecretMustExpireRule
        {
            public override string Key => "SecretMustExpire";
        }

        private class UnnamedParameterRule : SecretMustExpireRule
        {
            public override string Key => "Tests.UnnamedParameter";
            public override IReadOnlyList<ConfigurationRuleParameter> Parameters { get; } =
            [
                ConfigurationRuleParameter.Number(null, "Maximum days", "Days a secret may stay valid")
            ];
        }

        public sealed record RuleKey(string Value);

        public sealed class DisposalLog
        {
            public int Disposed { get; set; }
        }

        public sealed class ScopedDependency : IDisposable
        {
            public const string Name = "Secret must expire (scoped)";

            private readonly DisposalLog _log;
            private bool _disposed;

            public ScopedDependency(DisposalLog log)
            {
                _log = log;
            }

            public string DisplayName => _disposed ? throw new ObjectDisposedException(nameof(ScopedDependency)) : Name;

            public void Dispose()
            {
                _disposed = true;
                _log.Disposed++;
            }
        }

        private class ScopedDependencyRule : SecretMustExpireRule
        {
            public const string ScopedRuleKey = "Tests.ScopedDependency";

            private readonly ScopedDependency _dependency;

            public ScopedDependencyRule(ScopedDependency dependency)
            {
                _dependency = dependency;
            }

            public override string Key => ScopedRuleKey;

            public override string DisplayName => _dependency.DisplayName;
        }

        private class KeyFromServiceRule : SecretMustExpireRule
        {
            private readonly RuleKey _key;

            public KeyFromServiceRule(RuleKey key)
            {
                _key = key;
            }

            public override string Key => _key.Value;
        }
    }
}
