using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Dashboard;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;

public interface IDashboardService
{
    /// <summary>
    /// The counters of the configuration database, with the audit log statistics of the last
    /// <paramref name="auditLogsLastNumberOfDays"/> days. A non-positive number of days leaves the
    /// statistics out, so the counters do not depend on the audit log database at all; the
    /// statistics are served by <see cref="GetDashboardAuditLogStatisticsAsync"/> then.
    /// </summary>
    Task<DashboardDto> GetDashboardIdentityServerAsync(int auditLogsLastNumberOfDays,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// The audit log entries per day over the last <paramref name="lastNumberOfDays"/> days and their
    /// daily average, from one query. A non-positive number of days gives empty statistics.
    /// </summary>
    Task<DashboardAuditLogStatisticsDto> GetDashboardAuditLogStatisticsAsync(int lastNumberOfDays,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// The newest audit entries that record a change, for the dashboard's recent activity,
    /// found among the <paramref name="scanLimit"/> newest entries.
    /// </summary>
    Task<List<AuditLogDto>> GetRecentAuditChangesAsync(int count, int scanLimit, CancellationToken cancellationToken = default);
}
