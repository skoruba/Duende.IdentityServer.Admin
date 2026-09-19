// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Skoruba.AuditLogging.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Common;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces
{
    public interface IAuditLogRepository<TAuditLog> where TAuditLog : AuditLog
    {
        Task<PagedList<TAuditLog>> GetAsync(string @event, string source, string category, DateOnly? created, string subjectIdentifier, string subjectName, int page = 1, int pageSize = 10);

        Task<List<DashboardAuditLogDataView>> GetDashboardAuditLogsAsync(int lastNumberOfDays,
            CancellationToken cancellationToken = default);

        Task<int> GetDashboardAuditLogsAverageAsync(int lastNumberOfDays,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// The newest audit entries that record a change, newest first. Read events
        /// ("...RequestedEvent") are left out.
        /// </summary>
        /// <param name="count">How many changes to return.</param>
        /// <param name="scanLimit">How many of the newest entries are inspected to find them.</param>
        Task<List<TAuditLog>> GetRecentChangesAsync(int count, int scanLimit, CancellationToken cancellationToken = default);
        
        Task DeleteLogsOlderThanAsync(DateTime deleteOlderThan);

        bool AutoSaveChanges { get; set; }
    }
}