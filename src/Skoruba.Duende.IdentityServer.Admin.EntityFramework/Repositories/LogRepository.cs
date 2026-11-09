// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Common;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Enums;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Extensions;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories
{
    public class LogRepository<TDbContext> : ILogRepository
        where TDbContext : DbContext, IAdminLogDbContext
    {
        protected readonly TDbContext DbContext;

        public LogRepository(TDbContext dbContext)
        {
            DbContext = dbContext;
        }

        public virtual async Task DeleteLogsOlderThanAsync(DateTime deleteOlderThan)
        {
            var threshold = deleteOlderThan.Date;

            if (AutoSaveChanges && DbContext.Database.IsRelational())
            {
                await DbContext.Logs.Where(x => x.TimeStamp < threshold).ExecuteDeleteAsync();
                return;
            }

            var logsToDelete = await DbContext.Logs.Where(x => x.TimeStamp < threshold).ToListAsync();
            if (logsToDelete.Count == 0) return;

            DbContext.Logs.RemoveRange(logsToDelete);
            await AutoSaveChangesAsync();
        }

        public virtual Task<PagedList<Log>> GetLogsAsync(string search, int page = 1, int pageSize = 10)
        {
            return GetLogsAsync(search, null, null, null, page, pageSize);
        }

        /// <summary>
        /// <paramref name="from"/> is inclusive, <paramref name="to"/> exclusive.
        /// </summary>
        public virtual async Task<PagedList<Log>> GetLogsAsync(string search, IReadOnlyCollection<string> levels, DateTimeOffset? from, DateTimeOffset? to,
            int page = 1, int pageSize = 10)
        {
            pageSize = QueryableExtensions.NormalizePageSize(pageSize);

            var pagedList = new PagedList<Log>();
            // PostgreSQL compares case-sensitively, SQL Server by its collation; lower case on both sides finds the same everywhere
            var term = search?.ToLower();
            Expression<Func<Log, bool>> searchCondition = x =>
                (x.LogEvent != null && x.LogEvent.ToLower().Contains(term)) ||
                (x.Message != null && x.Message.ToLower().Contains(term)) ||
                (x.Exception != null && x.Exception.ToLower().Contains(term));
            var levelList = levels?.Where(x => !string.IsNullOrWhiteSpace(x)).ToList() ?? [];
            // PostgreSQL takes a time stamp with time zone only in UTC
            var fromUtc = from?.ToUniversalTime();
            var toUtc = to?.ToUniversalTime();

            var query = DbContext.Logs
                .WhereIf(!string.IsNullOrEmpty(search), searchCondition)
                .WhereIf(levelList.Count > 0, x => levelList.Contains(x.Level))
                .WhereIf(fromUtc.HasValue, x => x.TimeStamp >= fromUtc.Value)
                .WhereIf(toUtc.HasValue, x => x.TimeStamp < toUtc.Value);

            var logs = await query
                .PageBy(x => x.Id, page, pageSize)
                .ToListAsync();

            pagedList.Data.AddRange(logs);
            pagedList.PageSize = pageSize;
            pagedList.TotalCount = await query.CountAsync();

            return pagedList;
        }

        protected virtual async Task<int> AutoSaveChangesAsync()
        {
            return AutoSaveChanges ? await DbContext.SaveChangesAsync() : (int)SavedStatus.WillBeSavedExplicitly;
        }

        public virtual async Task<int> SaveAllChangesAsync()
        {
            return await DbContext.SaveChangesAsync();
        }

        public bool AutoSaveChanges { get; set; } = true;
    }
}
