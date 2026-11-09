// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Repositories
{
    public class LogRepositoryTests
    {
        private static async Task<LogRepository<AdminLogDbContext>> GetRepositoryAsync()
        {
            var options = new DbContextOptionsBuilder<AdminLogDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            var context = new AdminLogDbContext(options);

            context.Logs.Add(new Log
            {
                Level = "Error",
                Message = "Request validation failed",
                LogEvent = "{\"Properties\":{\"RequestPath\":\"/connect/authorize\"}}",
                Exception = "System.InvalidOperationException: Boom",
                TimeStamp = DateTimeOffset.UtcNow
            });
            context.Logs.Add(new Log
            {
                Level = "Warning",
                Message = "Without exception and event",
                TimeStamp = DateTimeOffset.UtcNow
            });
            await context.SaveChangesAsync();

            return new LogRepository<AdminLogDbContext>(context);
        }

        [Theory]
        [InlineData("validation", 1)]
        [InlineData("VALIDATION", 1)]
        [InlineData("Authorize", 1)]
        [InlineData("invalidoperation", 1)]
        [InlineData("without", 1)]
        [InlineData("not there", 0)]
        public async Task GetLogsAsyncSearchesTheMessageTheExceptionAndTheEventIgnoringCase(string search, int expectedCount)
        {
            var repository = await GetRepositoryAsync();

            var logs = await repository.GetLogsAsync(search);

            logs.TotalCount.Should().Be(expectedCount);
            logs.Data.Should().HaveCount(expectedCount);
        }

        private static async Task<LogRepository<AdminLogDbContext>> GetRepositoryAsync(params (string Level, string Message, DateTimeOffset TimeStamp)[] logs)
        {
            var options = new DbContextOptionsBuilder<AdminLogDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            var context = new AdminLogDbContext(options);

            foreach (var (level, message, timeStamp) in logs)
            {
                context.Logs.Add(new Log { Level = level, Message = message, TimeStamp = timeStamp });
            }

            await context.SaveChangesAsync();

            return new LogRepository<AdminLogDbContext>(context);
        }

        private static readonly DateTimeOffset NineThirty = new(2026, 11, 9, 9, 30, 0, TimeSpan.FromHours(1));

        [Fact]
        public async Task GetLogsAsyncFiltersByLevels()
        {
            var repository = await GetRepositoryAsync(
                ("Error", "error", NineThirty),
                ("Warning", "warning", NineThirty),
                ("Information", "information", NineThirty));

            var logs = await repository.GetLogsAsync(null, new[] { "Error", "Warning" }, null, null);

            logs.Data.Select(x => x.Message).Should().BeEquivalentTo("error", "warning");
        }

        [Fact]
        public async Task GetLogsAsyncFiltersByTimeFromInclusiveToExclusive()
        {
            var repository = await GetRepositoryAsync(
                ("Error", "before", NineThirty.AddSeconds(-1)),
                ("Error", "at from", NineThirty),
                ("Error", "inside", NineThirty.AddMinutes(10)),
                ("Error", "just before to", NineThirty.AddMinutes(15).AddMilliseconds(-1)),
                ("Error", "at to", NineThirty.AddMinutes(15)));

            var logs = await repository.GetLogsAsync(null, null, NineThirty, NineThirty.AddMinutes(15));

            logs.Data.Select(x => x.Message).Should().BeEquivalentTo("at from", "inside", "just before to");
            logs.TotalCount.Should().Be(3);
        }

        [Fact]
        public async Task GetLogsAsyncComparesInstantsWhateverTheOffset()
        {
            var repository = await GetRepositoryAsync(("Error", "nine thirty in Prague", NineThirty));

            var fromUtc = new DateTimeOffset(2026, 11, 9, 8, 30, 0, TimeSpan.Zero);

            (await repository.GetLogsAsync(null, null, fromUtc, fromUtc.AddMinutes(1))).TotalCount.Should().Be(1);
            (await repository.GetLogsAsync(null, null, fromUtc.AddMinutes(1), null)).TotalCount.Should().Be(0);
        }

        [Fact]
        public async Task GetLogsAsyncCombinesTheFiltersWithTheSearch()
        {
            var repository = await GetRepositoryAsync(
                ("Error", "Request validation failed", NineThirty),
                ("Warning", "Request validation failed", NineThirty),
                ("Error", "Something else", NineThirty),
                ("Error", "Request validation failed", NineThirty.AddDays(-1)));

            var logs = await repository.GetLogsAsync("validation", new[] { "Error" }, NineThirty.AddHours(-1), NineThirty.AddHours(1));

            logs.TotalCount.Should().Be(1);
            logs.Data.Should().ContainSingle(x => x.Level == "Error" && x.TimeStamp == NineThirty);
        }

        [Fact]
        public async Task GetLogsAsyncWithoutSearchReturnsAll()
        {
            var repository = await GetRepositoryAsync();

            var logs = await repository.GetLogsAsync(null);

            logs.TotalCount.Should().Be(2);
        }
    }
}
