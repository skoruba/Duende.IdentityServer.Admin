// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

/// <summary>
/// Built once at startup from every <see cref="ConfigurationRuleRegistration"/> - the host builds
/// it through <see cref="ConfigurationRuleRegistryStartupCheck"/>. A rule that cannot be
/// registered - a malformed or duplicate key, a parameter without a name - fails the startup
/// with the offending type in the message rather than failing later in the UI.
/// </summary>
public sealed class ConfigurationRuleRegistry : IConfigurationRuleRegistry
{
    private readonly Dictionary<string, ConfigurationRuleDescriptor> _byKey = new(StringComparer.Ordinal);

    public ConfigurationRuleRegistry(IEnumerable<ConfigurationRuleRegistration> registrations, IServiceProvider serviceProvider)
    {
        ArgumentNullException.ThrowIfNull(registrations);
        ArgumentNullException.ThrowIfNull(serviceProvider);

        // A rule may depend on scoped services just like the instance of a validation run. The
        // descriptor copies the metadata, so the instances and the scope end with the registration.
        using var scope = serviceProvider.CreateScope();

        foreach (var registration in registrations.DistinctBy(registration => registration.ImplementationType))
        {
            var descriptor = Describe(registration, scope.ServiceProvider);

            if (_byKey.TryGetValue(descriptor.Key, out var existing))
            {
                throw new InvalidOperationException(
                    $"Configuration rule key '{descriptor.Key}' is used by both {existing.ImplementationType.FullName} and {descriptor.ImplementationType.FullName}.");
            }

            _byKey.Add(descriptor.Key, descriptor);
        }

        // Grouped the way the Admin UI lists them: by the resource the rule checks, then by name.
        Rules = _byKey.Values
            .OrderBy(descriptor => descriptor.Metadata.ResourceType)
            .ThenBy(descriptor => descriptor.Metadata.DisplayName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(descriptor => descriptor.Key, StringComparer.Ordinal)
            .ToList();
    }

    public IReadOnlyList<ConfigurationRuleDescriptor> Rules { get; }

    public ConfigurationRuleDescriptor Find(string key)
    {
        return key != null && _byKey.TryGetValue(key, out var descriptor) ? descriptor : null;
    }

    private static ConfigurationRuleDescriptor Describe(ConfigurationRuleRegistration registration, IServiceProvider serviceProvider)
    {
        var type = registration.ImplementationType;

        ConfigurationRuleDescriptor descriptor;
        try
        {
            var rule = (IConfigurationRule)ActivatorUtilities.CreateInstance(serviceProvider, type);
            descriptor = new ConfigurationRuleDescriptor(type, rule, registration.IsBuiltIn);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Configuration rule {type.FullName} could not be created: {ex.Message}", ex);
        }

        try
        {
            ConfigurationRuleKeys.Validate(descriptor.Key, registration.IsBuiltIn);
            Validate(descriptor.Metadata);
        }
        catch (ArgumentException ex)
        {
            throw new InvalidOperationException($"Configuration rule {type.FullName} cannot be registered: {ex.Message}", ex);
        }

        return descriptor;
    }

    private static void Validate(IConfigurationRuleMetadata rule)
    {
        if (!Enum.IsDefined(rule.ResourceType))
        {
            throw new ArgumentException($"Resource type '{rule.ResourceType}' is not a {nameof(ConfigurationResourceType)}.");
        }

        if (string.IsNullOrWhiteSpace(rule.DisplayName))
        {
            throw new ArgumentException("The rule needs a display name; the Admin UI lists rules by it.");
        }

        if (string.IsNullOrWhiteSpace(rule.DefaultMessageTemplate))
        {
            throw new ArgumentException("The rule needs a default message template; it is the message of every issue it reports until the administrator changes it.");
        }

        var parameters = rule.Parameters ?? Array.Empty<ConfigurationRuleParameter>();

        if (parameters.Any(parameter => string.IsNullOrWhiteSpace(parameter?.Name)))
        {
            throw new ArgumentException("Every parameter needs a name; it is the property of the rule's JSON configuration.");
        }

        var duplicate = parameters.GroupBy(parameter => parameter.Name, StringComparer.OrdinalIgnoreCase).FirstOrDefault(group => group.Count() > 1);
        if (duplicate != null)
        {
            throw new ArgumentException($"Parameter '{duplicate.Key}' is declared more than once.");
        }
    }
}
