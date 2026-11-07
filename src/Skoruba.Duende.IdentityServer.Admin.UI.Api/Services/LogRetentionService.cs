// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Services
{
    /// <summary>
    /// Deletes the log events older than <see cref="DatabaseLogConfiguration.RetentionDays"/>. It goes
    /// through the repository and not the log service, which writes an audit event for a user.
    /// </summary>
    public class LogRetentionService(IServiceScopeFactory scopeFactory, DatabaseLogConfiguration configuration,
        ILogger<LogRetentionService> logger) : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromDays(1);

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (configuration.RetentionDays <= 0)
            {
                return;
            }

            using var timer = new PeriodicTimer(Interval);

            do
            {
                await DeleteExpiredLogsAsync(stoppingToken);
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }

        public virtual async Task DeleteExpiredLogsAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<ILogRepository>();

                await repository.DeleteLogsOlderThanAsync(DateTime.UtcNow.AddDays(-configuration.RetentionDays));
            }
            catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
            {
                logger.LogError(ex, "Deleting the log events older than {RetentionDays} days failed", configuration.RetentionDays);
            }
        }
    }
}
