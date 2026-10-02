using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Dashboard;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services;

public class DashboardService : IDashboardService
{
    protected readonly IDashboardRepository DashboardRepository;
    protected readonly IAuditLogService AuditLogService;

    public DashboardService(IDashboardRepository dashboardRepository, IAuditLogService auditLogService)
    {
        DashboardRepository = dashboardRepository;
        AuditLogService = auditLogService;
    }

    public virtual async Task<DashboardDto> GetDashboardIdentityServerAsync(int auditLogsLastNumberOfDays, CancellationToken cancellationToken = default)
    {
        var dashBoardData = await DashboardRepository.GetDashboardIdentityServerAsync(auditLogsLastNumberOfDays, cancellationToken);
        var auditLogs = await GetDashboardAuditLogStatisticsAsync(auditLogsLastNumberOfDays, cancellationToken);

        return new DashboardDto
        {
            ClientsTotal = dashBoardData.ClientsTotal,
            ApiResourcesTotal = dashBoardData.ApiResourcesTotal,
            ApiScopesTotal = dashBoardData.ApiScopesTotal,
            IdentityResourcesTotal = dashBoardData.IdentityResourcesTotal,
            AuditLogsAvg = auditLogs.AuditLogsAvg,
            AuditLogsPerDaysTotal = auditLogs.AuditLogsPerDaysTotal,
            IdentityProvidersTotal = dashBoardData.IdentityProvidersTotal
        };
    }

    public virtual async Task<DashboardAuditLogStatisticsDto> GetDashboardAuditLogStatisticsAsync(int lastNumberOfDays, CancellationToken cancellationToken = default)
    {
        if (lastNumberOfDays <= 0)
        {
            return new DashboardAuditLogStatisticsDto();
        }

        var auditLogsPerDay = await AuditLogService.GetDashboardAuditLogsAsync(lastNumberOfDays, cancellationToken);

        return new DashboardAuditLogStatisticsDto
        {
            AuditLogsPerDaysTotal = auditLogsPerDay,
            // One query serves both numbers: the average used to be a second pass over the same rows.
            AuditLogsAvg = auditLogsPerDay.Count > 0 ? (long)auditLogsPerDay.Average(x => x.Total) : 0
        };
    }

    public virtual Task<List<AuditLogDto>> GetRecentAuditChangesAsync(int count, int scanLimit, CancellationToken cancellationToken = default)
    {
        return AuditLogService.GetRecentChangesAsync(count, scanLimit, cancellationToken);
    }
}
