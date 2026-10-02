using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Dashboard;

/// <summary>
/// The audit log activity of the last days: the number of entries per day and their daily average.
/// Served separately from the dashboard counters, so a slow or failing audit log database
/// does not hold the counters back.
/// </summary>
public class DashboardAuditLogStatisticsDto
{
    /// <summary>
    /// Mean number of entries over the days that have any; 0 without data.
    /// </summary>
    public long AuditLogsAvg { get; set; }

    /// <summary>
    /// Entries per day, oldest day first. Days without entries are left out.
    /// </summary>
    public List<DashboardAuditLogDto> AuditLogsPerDaysTotal { get; set; } = new();
}
