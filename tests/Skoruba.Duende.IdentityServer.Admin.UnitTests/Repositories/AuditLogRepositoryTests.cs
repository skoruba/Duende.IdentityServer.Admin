// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Skoruba.AuditLogging.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Repositories
{
    public class AuditLogRepositoryTests
    {
        private static AdminAuditLogDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AdminAuditLogDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new AdminAuditLogDbContext(options);
        }

        private static async Task SeedAsync(AdminAuditLogDbContext context, params string[] eventsOldestFirst)
        {
            foreach (var @event in eventsOldestFirst)
            {
                context.AuditLog.Add(new AuditLog { Event = @event, Created = DateTime.UtcNow, Data = "{}" });
            }

            await context.SaveChangesAsync();
        }

        private const int DefaultScanLimit = 5000;

        [Fact]
        public async Task GetRecentChangesAsync_ReturnsChangesOnly_NewestFirst()
        {
            using var context = GetDbContext();
            await SeedAsync(context,
                "ClientAddedEvent",
                "ClientsRequestedEvent",
                "UserUpdatedEvent",
                "KeysRequestedEvent",
                "ClientSecretDeletedEvent",
                "ClientRequestedEvent");

            var repository = new AuditLogRepository<AdminAuditLogDbContext, AuditLog>(context);

            var changes = await repository.GetRecentChangesAsync(10, DefaultScanLimit);

            changes.Select(x => x.Event).Should().Equal(
                "ClientSecretDeletedEvent",
                "UserUpdatedEvent",
                "ClientAddedEvent");
        }

        [Fact]
        public async Task GetRecentChangesAsync_RespectsTheRequestedCount()
        {
            using var context = GetDbContext();
            await SeedAsync(context, "ClientAddedEvent", "ClientUpdatedEvent", "ClientDeletedEvent");

            var repository = new AuditLogRepository<AdminAuditLogDbContext, AuditLog>(context);

            var changes = await repository.GetRecentChangesAsync(2, DefaultScanLimit);

            changes.Select(x => x.Event).Should().Equal("ClientDeletedEvent", "ClientUpdatedEvent");
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-5)]
        public async Task GetRecentChangesAsync_ReturnsAtLeastOneEntryForANonPositiveCount(int requested)
        {
            using var context = GetDbContext();
            await SeedAsync(context, "ClientAddedEvent", "ClientUpdatedEvent");

            var repository = new AuditLogRepository<AdminAuditLogDbContext, AuditLog>(context);

            var changes = await repository.GetRecentChangesAsync(requested, DefaultScanLimit);

            changes.Select(x => x.Event).Should().Equal("ClientUpdatedEvent");
        }

        [Fact]
        public async Task GetRecentChangesAsync_NeverScansFewerEntriesThanItShouldReturn()
        {
            using var context = GetDbContext();
            await SeedAsync(context, "ClientAddedEvent", "ClientUpdatedEvent", "ClientDeletedEvent");

            var repository = new AuditLogRepository<AdminAuditLogDbContext, AuditLog>(context);

            // A misconfigured scan limit (0) must not silently return nothing.
            var changes = await repository.GetRecentChangesAsync(3, scanLimit: 0);

            changes.Should().HaveCount(3);
        }

        [Fact]
        public async Task GetRecentChangesAsync_LooksOnlyAtTheNewestEntries()
        {
            using var context = GetDbContext();
            // An old change followed by more reads than the scan window holds: finding it would
            // mean scanning past the window, which is exactly what must not happen on a large log.
            await SeedAsync(context, new[] { "ClientAddedEvent" }
                .Concat(Enumerable.Repeat("ClientsRequestedEvent", 5))
                .ToArray());

            var repository = new AuditLogRepository<AdminAuditLogDbContext, AuditLog>(context);

            (await repository.GetRecentChangesAsync(1, scanLimit: 5)).Should().BeEmpty();

            // The same change is found as soon as it falls inside the window.
            (await repository.GetRecentChangesAsync(1, scanLimit: 6)).Select(x => x.Event)
                .Should().Equal("ClientAddedEvent");
        }

        [Fact]
        public async Task GetRecentChangesAsync_IgnoresEntriesWithoutAnEventName()
        {
            using var context = GetDbContext();
            await SeedAsync(context, "ClientAddedEvent", null);

            var repository = new AuditLogRepository<AdminAuditLogDbContext, AuditLog>(context);

            (await repository.GetRecentChangesAsync(10, DefaultScanLimit)).Select(x => x.Event)
                .Should().Equal("ClientAddedEvent");
        }
    }
}
