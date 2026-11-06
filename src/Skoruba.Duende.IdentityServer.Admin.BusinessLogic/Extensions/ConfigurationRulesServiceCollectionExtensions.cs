// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Extensions
{
    /// <summary>
    /// Registration of configuration rules. Call these before or after
    /// <c>AddIdentityServerAdminApi</c> - the order does not matter. A registered rule shows up
    /// in the Admin UI under Configuration Rules, where the administrator creates and tunes it;
    /// no migration is involved.
    /// </summary>
    public static class ConfigurationRulesServiceCollectionExtensions
    {
        /// <summary>
        /// Registers one custom rule. Its <see cref="IConfigurationRule.Key"/> must be namespaced,
        /// e.g. <c>Contoso.ClientSecretMustExpireWithinOneYear</c>.
        /// </summary>
        public static IServiceCollection AddConfigurationRule<TRule>(this IServiceCollection services)
            where TRule : class, IConfigurationRule
        {
            return services.AddConfigurationRule(typeof(TRule));
        }

        public static IServiceCollection AddConfigurationRule(this IServiceCollection services, Type ruleType)
        {
            return services.AddConfigurationRule(ruleType, isBuiltIn: false);
        }

        /// <summary>
        /// Registers every concrete <see cref="IConfigurationRule"/> in the assembly that contains
        /// <typeparamref name="TMarker"/> as a custom rule.
        /// </summary>
        public static IServiceCollection AddConfigurationRulesFromAssemblyContaining<TMarker>(this IServiceCollection services)
        {
            return services.AddConfigurationRulesFromAssembly(typeof(TMarker).Assembly);
        }

        public static IServiceCollection AddConfigurationRulesFromAssembly(this IServiceCollection services, Assembly assembly)
        {
            return services.AddConfigurationRulesFromAssembly(assembly, isBuiltIn: false);
        }

        /// <summary>
        /// The rules shipped with this project. <c>AddAdminServices</c> calls this.
        /// </summary>
        public static IServiceCollection AddBuiltInConfigurationRules(this IServiceCollection services)
        {
            return services.AddConfigurationRulesFromAssembly(typeof(ConfigurationRuleBase).Assembly, isBuiltIn: true);
        }

        private static IServiceCollection AddConfigurationRulesFromAssembly(this IServiceCollection services, Assembly assembly, bool isBuiltIn)
        {
            ArgumentNullException.ThrowIfNull(assembly);

            var ruleTypes = assembly.GetTypes()
                .Where(type => type.IsClass && !type.IsAbstract && !type.IsGenericTypeDefinition && typeof(IConfigurationRule).IsAssignableFrom(type))
                .OrderBy(type => type.FullName, StringComparer.Ordinal);

            foreach (var ruleType in ruleTypes)
            {
                services.AddConfigurationRule(ruleType, isBuiltIn);
            }

            return services.AddConfigurationRuleRegistry();
        }

        private static IServiceCollection AddConfigurationRule(this IServiceCollection services, Type ruleType, bool isBuiltIn)
        {
            ArgumentNullException.ThrowIfNull(services);

            var registration = new ConfigurationRuleRegistration(ruleType, isBuiltIn);

            var alreadyRegistered = services.Any(descriptor =>
                descriptor.ServiceType == typeof(ConfigurationRuleRegistration)
                && descriptor.ImplementationInstance is ConfigurationRuleRegistration existing
                && existing.ImplementationType == ruleType);

            if (!alreadyRegistered)
            {
                services.AddSingleton(registration);
            }

            return services.AddConfigurationRuleRegistry();
        }

        private static IServiceCollection AddConfigurationRuleRegistry(this IServiceCollection services)
        {
            services.TryAddSingleton<IConfigurationRuleRegistry, ConfigurationRuleRegistry>();
            services.TryAddEnumerable(ServiceDescriptor.Singleton<IHostedService, ConfigurationRuleRegistryStartupCheck>());
            return services;
        }
    }
}
