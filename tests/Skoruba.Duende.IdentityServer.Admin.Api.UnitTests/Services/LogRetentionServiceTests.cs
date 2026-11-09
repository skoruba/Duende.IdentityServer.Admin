// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Services;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Services
{
    public class LogRetentionServiceTests
    {
        private static ServiceProvider BuildServices()
        {
            var services = new ServiceCollection();
            var databaseName = Guid.NewGuid().ToString();

            services.AddDbContext<AdminLogDbContext>(options => options.UseInMemoryDatabase(databaseName));
            services.AddTransient<ILogRepository, LogRepository<AdminLogDbContext>>();

            return services.BuildServiceProvider();
        }

        private static async Task SeedAsync(ServiceProvider services, params int[] ageInDays)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AdminLogDbContext>();

            foreach (var days in ageInDays)
            {
                context.Logs.Add(new Log
                {
                    Level = "Error",
                    Message = $"{days} days old",
                    TimeStamp = DateTimeOffset.UtcNow.AddDays(-days)
                });
            }

            await context.SaveChangesAsync();
        }

        private static string[] RemainingMessages(ServiceProvider services)
        {
            using var scope = services.CreateScope();

            return scope.ServiceProvider.GetRequiredService<AdminLogDbContext>().Logs
                .Select(x => x.Message)
                .OrderBy(x => x)
                .ToArray();
        }

        private static LogRetentionService CreateService(ServiceProvider services, int retentionDays) =>
            new(services.GetRequiredService<IServiceScopeFactory>(),
                new DatabaseLogConfiguration { RetentionDays = retentionDays },
                NullLogger<LogRetentionService>.Instance);

        [Fact]
        public async Task DeletesLogsOlderThanTheRetention()
        {
            using var services = BuildServices();
            await SeedAsync(services, 1, 29, 31, 400);

            await CreateService(services, 30).DeleteExpiredLogsAsync(CancellationToken.None);

            RemainingMessages(services).Should().BeEquivalentTo("1 days old", "29 days old");
        }

        [Fact]
        public async Task KeepsAllLogsWithoutRetention()
        {
            using var services = BuildServices();
            await SeedAsync(services, 1, 400);
            var service = CreateService(services, 0);

            await service.StartAsync(CancellationToken.None);
            await service.ExecuteTask!;

            RemainingMessages(services).Should().HaveCount(2);
        }
    }
}
