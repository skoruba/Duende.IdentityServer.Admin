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
        
        Task DeleteLogsOlderThanAsync(DateTime deleteOlderThan);

        bool AutoSaveChanges { get; set; }
    }
}