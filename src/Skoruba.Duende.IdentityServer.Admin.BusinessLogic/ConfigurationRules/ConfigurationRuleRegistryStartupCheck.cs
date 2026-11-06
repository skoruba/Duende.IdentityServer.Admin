// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

/// <summary>
/// Builds the <see cref="IConfigurationRuleRegistry"/> when the host starts. The registry is a
/// singleton that nothing else asks for during startup, so without this a rule that cannot be
/// registered would only fail the first request that lists or runs the rules.
/// </summary>
public sealed class ConfigurationRuleRegistryStartupCheck : IHostedService
{
    // Taking the registry is the check: the host creates hosted services before it starts.
    public ConfigurationRuleRegistryStartupCheck(IConfigurationRuleRegistry registry)
    {
    }

    public Task StartAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
