// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration
{
    /// <summary>
    /// The Log table the STS writes into and the Admin UI shows under Monitoring → Error Logs.
    /// </summary>
    public class DatabaseLogConfiguration
    {
        /// <summary>
        /// How many days the log events are kept. Older ones are deleted on startup and then once a day.
        /// Zero keeps them all.
        /// </summary>
        public int RetentionDays { get; set; }
    }
}
