// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Dashboard;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces
{
    public interface IAuditLogService
    {
        Task<AuditLogsDto> GetAsync(AuditLogFilterDto filters);

        Task DeleteLogsOlderThanAsync(DateTime deleteOlderThan);

        [Obsolete("The average is derived from the daily totals of GetDashboardAuditLogsAsync; computing it separately ran the same query twice.")]
        Task<int> GetDashboardAuditLogsAverageAsync(int lastNumberOfDays,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// The newest audit entries that record a change, newest first, found among the
        /// <paramref name="scanLimit"/> newest entries.
        /// </summary>
        Task<List<AuditLogDto>> GetRecentChangesAsync(int count, int scanLimit, CancellationToken cancellationToken = default);

        /// <summary>
        /// How many entries were written on each day of the last <paramref name="lastNumberOfDays"/>,
        /// oldest day first. Days without entries are left out.
        /// </summary>
        Task<List<DashboardAuditLogDto>> GetDashboardAuditLogsAsync(int lastNumberOfDays,
            CancellationToken cancellationToken = default);
    }
}
