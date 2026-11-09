// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Serilog.Events;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Configuration
{
    public class DatabaseLogConfiguration
    {
        public const string SectionName = nameof(DatabaseLogConfiguration);

        /// <summary>
        /// Writes the log events into the Log table of AdminLogDbConnection, shown under Monitoring → Error Logs in the Admin UI
        /// </summary>
        public bool Enabled { get; set; } = true;

        /// <summary>
        /// The lowest level written into the database, on top of the Serilog minimum level
        /// </summary>
        public LogEventLevel MinimumLevel { get; set; } = LogEventLevel.Warning;
    }
}
