// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
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

        [Fact]
        public async Task GetLogsAsyncWithoutSearchReturnsAll()
        {
            var repository = await GetRepositoryAsync();

            var logs = await repository.GetLogsAsync(null);

            logs.TotalCount.Should().Be(2);
        }
    }
}
