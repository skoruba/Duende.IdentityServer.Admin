// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Dashboard;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Services
{
    public class DashboardServiceTests
    {
        private static readonly DateTime Today = DateTime.Now.Date;

        private static Mock<IDashboardRepository> Counters()
        {
            var repository = new Mock<IDashboardRepository>();
            repository
                .Setup(x => x.GetDashboardIdentityServerAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new DashboardDataView
                {
                    ClientsTotal = 3,
                    ApiResourcesTotal = 4,
                    ApiScopesTotal = 5,
                    IdentityResourcesTotal = 6,
                    IdentityProvidersTotal = 7
                });

            return repository;
        }

        private static List<DashboardAuditLogDto> DailyTotals(params int[] totals)
        {
            var perDay = new List<DashboardAuditLogDto>();
            for (var i = 0; i < totals.Length; i++)
            {
                perDay.Add(new DashboardAuditLogDto { Created = Today.AddDays(i - totals.Length + 1), Total = totals[i] });
            }

            return perDay;
        }

        [Fact]
        public async Task GetDashboardAuditLogStatisticsAsync_DerivesTheAverageFromTheDailyTotals()
        {
            // Strict: the only query allowed is the one for the daily totals.
            var auditLogService = new Mock<IAuditLogService>(MockBehavior.Strict);
            var perDay = DailyTotals(10, 20, 31);
            auditLogService
                .Setup(x => x.GetDashboardAuditLogsAsync(30, It.IsAny<CancellationToken>()))
                .ReturnsAsync(perDay);

            var service = new DashboardService(Counters().Object, auditLogService.Object);

            var statistics = await service.GetDashboardAuditLogStatisticsAsync(30);

            statistics.AuditLogsPerDaysTotal.Should().BeSameAs(perDay);
            // (10 + 20 + 31) / 3 = 20.33, truncated as the previous separate query did.
            statistics.AuditLogsAvg.Should().Be(20);
            auditLogService.Verify(x => x.GetDashboardAuditLogsAsync(30, It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetDashboardAuditLogStatisticsAsync_IsEmptyWithoutEntries()
        {
            var auditLogService = new Mock<IAuditLogService>(MockBehavior.Strict);
            auditLogService
                .Setup(x => x.GetDashboardAuditLogsAsync(30, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<DashboardAuditLogDto>());

            var service = new DashboardService(Counters().Object, auditLogService.Object);

            var statistics = await service.GetDashboardAuditLogStatisticsAsync(30);

            statistics.AuditLogsPerDaysTotal.Should().BeEmpty();
            statistics.AuditLogsAvg.Should().Be(0);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-5)]
        public async Task GetDashboardAuditLogStatisticsAsync_LeavesTheAuditLogAloneForANonPositiveWindow(int lastNumberOfDays)
        {
            var auditLogService = new Mock<IAuditLogService>(MockBehavior.Strict);

            var service = new DashboardService(Counters().Object, auditLogService.Object);

            var statistics = await service.GetDashboardAuditLogStatisticsAsync(lastNumberOfDays);

            statistics.AuditLogsPerDaysTotal.Should().BeEmpty();
            statistics.AuditLogsAvg.Should().Be(0);
            auditLogService.VerifyNoOtherCalls();
        }

        [Fact]
        public async Task GetDashboardIdentityServerAsync_WithoutAuditLogDays_ReturnsTheCountersWithoutTouchingTheAuditLog()
        {
            var auditLogService = new Mock<IAuditLogService>(MockBehavior.Strict);

            var service = new DashboardService(Counters().Object, auditLogService.Object);

            var dashboard = await service.GetDashboardIdentityServerAsync(0);

            dashboard.ClientsTotal.Should().Be(3);
            dashboard.ApiResourcesTotal.Should().Be(4);
            dashboard.ApiScopesTotal.Should().Be(5);
            dashboard.IdentityResourcesTotal.Should().Be(6);
            dashboard.IdentityProvidersTotal.Should().Be(7);
            dashboard.AuditLogsPerDaysTotal.Should().BeEmpty();
            dashboard.AuditLogsAvg.Should().Be(0);
            auditLogService.VerifyNoOtherCalls();
        }

        [Fact]
        public async Task GetDashboardIdentityServerAsync_WithAuditLogDays_StillCarriesTheStatistics()
        {
            var auditLogService = new Mock<IAuditLogService>(MockBehavior.Strict);
            auditLogService
                .Setup(x => x.GetDashboardAuditLogsAsync(7, It.IsAny<CancellationToken>()))
                .ReturnsAsync(DailyTotals(4, 8));

            var service = new DashboardService(Counters().Object, auditLogService.Object);

            var dashboard = await service.GetDashboardIdentityServerAsync(7);

            dashboard.ClientsTotal.Should().Be(3);
            dashboard.AuditLogsPerDaysTotal.Should().HaveCount(2);
            dashboard.AuditLogsAvg.Should().Be(6);
        }
    }
}
