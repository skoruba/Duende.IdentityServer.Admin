// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration
{
    /// <summary>
    /// Tuning of the dashboard endpoints. Every value has a working default, so the
    /// "DashboardConfiguration" section is optional and can set only what it needs to change.
    /// </summary>
    public class DashboardConfiguration
    {
        /// <summary>
        /// How many recent audit changes are returned when the caller does not ask for a count.
        /// </summary>
        public int RecentAuditChangesDefaultCount { get; set; } = 8;

        /// <summary>
        /// The most recent audit changes a caller can ask for.
        /// </summary>
        public int RecentAuditChangesMaxCount { get; set; } = 50;

        /// <summary>
        /// How many of the newest audit entries are inspected when looking for changes. The audit
        /// log is indexed by its primary key only and mostly holds read events, so the bound keeps
        /// the query cheap on a large log; raise it if changes are rare compared to reads.
        /// </summary>
        public int RecentAuditChangesScanLimit { get; set; } = 5000;

        /// <summary>
        /// How long the system health report is reused. A report runs every registered health check,
        /// and the dashboard asks for it from every open tab. Zero turns the reuse off.
        /// </summary>
        public int SystemHealthCacheSeconds { get; set; } = 30;
    }
}
