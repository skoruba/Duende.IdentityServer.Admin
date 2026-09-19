using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Dashboard;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardIdentityServerAsync(int auditLogsLastNumberOfDays,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// The newest audit entries that record a change, for the dashboard's recent activity,
    /// found among the <paramref name="scanLimit"/> newest entries.
    /// </summary>
    Task<List<AuditLogDto>> GetRecentAuditChangesAsync(int count, int scanLimit, CancellationToken cancellationToken = default);
}