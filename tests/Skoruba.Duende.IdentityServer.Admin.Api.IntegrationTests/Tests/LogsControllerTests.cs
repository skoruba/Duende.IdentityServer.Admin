// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Logs;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class LogsControllerTests : AdminApiTestBase
    {
        private const string ErrorLogRoute = "api/logs/errorlog";

        public LogsControllerTests(TestFixture fixture) : base(fixture)
        {
        }

        private Task<string> SeedLogsAsync(params int[] ageInDays) =>
            SeedLogsAsync(ageInDays.Select(days => (DateTimeOffset.UtcNow.AddDays(-days), $"{days} days old")).ToArray());

        private Task<string> SeedLogsAsync(params (DateTimeOffset TimeStamp, string Name)[] logs) =>
            SeedLogsAsync(logs.Select(x => (x.TimeStamp, x.Name, "Error")).ToArray());

        private async Task<string> SeedLogsAsync(params (DateTimeOffset TimeStamp, string Name, string Level)[] logs)
        {
            var marker = UniqueValue("error_log");

            using var scope = TestServer.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AdminLogDbContext>();

            foreach (var (timeStamp, name, level) in logs)
            {
                context.Logs.Add(new Log
                {
                    Level = level,
                    Message = $"{marker} {name}",
                    MessageTemplate = "{Marker} days old",
                    Exception = "System.InvalidOperationException: boom",
                    LogEvent = "{\"Properties\":{\"SourceContext\":\"Tests\"}}",
                    TimeStamp = timeStamp
                });
            }

            await context.SaveChangesAsync();

            return marker;
        }

        private async Task<int> CountLogsAsync(string marker)
        {
            using var scope = TestServer.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AdminLogDbContext>();

            return await context.Logs.CountAsync(x => x.Message.StartsWith(marker));
        }

        [Fact]
        public async Task GetErrorLogsReturnsTheNewestFirstAndSearches()
        {
            SetupAdminAuthorization();
            var marker = await SeedLogsAsync(3, 1, 2);

            var logs = await Client.GetFromJsonAsync<ErrorLogsApiDto>($"{ErrorLogRoute}?searchText={marker}&page=1&pageSize=10");

            logs.Should().NotBeNull();
            logs!.TotalCount.Should().Be(3);
            logs.Logs.Select(x => x.Message).Should().Equal($"{marker} 2 days old", $"{marker} 1 days old", $"{marker} 3 days old");

            var log = logs.Logs.First();
            log.Level.Should().Be("Error");
            log.Exception.Should().Contain("InvalidOperationException");
            log.LogEvent.Should().Contain("SourceContext");
            log.MessageTemplate.Should().Be("{Marker} days old");
        }

        [Fact]
        public async Task GetErrorLogsFiltersByLevelsAndTime()
        {
            SetupAdminAuthorization();
            var from = new DateTimeOffset(2026, 11, 9, 8, 30, 0, TimeSpan.Zero);
            var marker = await SeedLogsAsync(
                (from.AddSeconds(-1), "before", "Error"),
                (from, "at from", "Error"),
                (from.AddMinutes(5), "warning inside", "Warning"),
                (from.AddMinutes(10), "information inside", "Information"),
                (from.AddMinutes(16), "at to", "Error"));

            var query = $"searchText={marker}&levels=Error&levels=Warning" +
                        $"&from={Uri.EscapeDataString(from.ToString("O"))}&to={Uri.EscapeDataString(from.AddMinutes(16).ToString("O"))}";
            var logs = await Client.GetFromJsonAsync<ErrorLogsApiDto>($"{ErrorLogRoute}?{query}");

            logs!.TotalCount.Should().Be(2);
            logs.Logs.Select(x => x.Message).Should().Equal($"{marker} warning inside", $"{marker} at from");
        }

        [Fact]
        public async Task DeleteErrorLogsDeletesOlderThanTheDay()
        {
            SetupAdminAuthorization();
            var marker = await SeedLogsAsync(1, 10, 20);
            var deleteOlderThan = Uri.EscapeDataString(DateTime.UtcNow.AddDays(-5).ToString("yyyy-MM-dd") + "T00:00:00.000Z");

            var response = await Client.DeleteAsync($"{ErrorLogRoute}?deleteOlderThan={deleteOlderThan}");

            response.StatusCode.Should().Be(HttpStatusCode.NoContent);
            (await CountLogsAsync(marker)).Should().Be(1);
        }

        [Fact]
        public async Task DeleteErrorLogsKeepsThePickedDay()
        {
            SetupAdminAuthorization();
            var pickedDay = new DateTimeOffset(DateTime.UtcNow.Date.AddDays(-3), TimeSpan.Zero);
            var marker = await SeedLogsAsync(
                (pickedDay.AddMinutes(-30), "the day before"),
                (pickedDay.AddMinutes(30), "the picked day"));

            var response = await Client.DeleteAsync($"{ErrorLogRoute}?deleteOlderThan={Uri.EscapeDataString(pickedDay.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"))}");

            response.StatusCode.Should().Be(HttpStatusCode.NoContent);
            using var scope = TestServer.Services.CreateScope();
            var remaining = await scope.ServiceProvider.GetRequiredService<AdminLogDbContext>().Logs
                .Where(x => x.Message.StartsWith(marker))
                .Select(x => x.Message)
                .ToListAsync();
            remaining.Should().Equal($"{marker} the picked day");
        }

        [Fact]
        public async Task ErrorLogsWithoutPermissionsReturnUnauthorized()
        {
            ClearAuthorization();

            (await Client.GetAsync(ErrorLogRoute)).StatusCode.Should().Be(HttpStatusCode.Unauthorized);
            (await Client.DeleteAsync($"{ErrorLogRoute}?deleteOlderThan=2000-01-01")).StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
