// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Extensions.Configuration;
using NpgsqlTypes;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
using Serilog.Sinks.PostgreSQL.ColumnWriters;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration;
using Skoruba.Duende.IdentityServer.STS.Identity.Configuration;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Helpers
{
    public static class SerilogDatabaseExtensions
    {
        public const string AdminLogDbConnectionName = "AdminLogDbConnection";

        // The table and its columns come from the AdminLogDbContext migrations
        public const string LogTableName = "Log";

        public static LoggerConfiguration WriteToAdminLogDatabase(this LoggerConfiguration loggerConfiguration, IConfiguration configuration)
        {
            var databaseLogConfiguration = configuration.GetSection(DatabaseLogConfiguration.SectionName).Get<DatabaseLogConfiguration>() ?? new DatabaseLogConfiguration();
            var connectionString = configuration.GetConnectionString(AdminLogDbConnectionName);

            if (!databaseLogConfiguration.Enabled || string.IsNullOrWhiteSpace(connectionString))
            {
                return loggerConfiguration;
            }

            var databaseProvider = configuration.GetSection(nameof(DatabaseProviderConfiguration)).Get<DatabaseProviderConfiguration>() ?? new DatabaseProviderConfiguration();

            return databaseProvider.ProviderType == DatabaseProviderType.PostgreSQL
                ? loggerConfiguration.WriteToPostgreSql(connectionString, databaseLogConfiguration.MinimumLevel)
                : loggerConfiguration.WriteToSqlServer(connectionString, databaseLogConfiguration.MinimumLevel);
        }

        private static LoggerConfiguration WriteToSqlServer(this LoggerConfiguration loggerConfiguration, string connectionString, LogEventLevel minimumLevel)
        {
            var columnOptions = new ColumnOptions();
            columnOptions.Store.Remove(StandardColumn.Properties);
            columnOptions.Store.Add(StandardColumn.LogEvent);
            columnOptions.Id.DataType = SqlDbType.BigInt;
            columnOptions.TimeStamp.DataType = SqlDbType.DateTimeOffset;
            columnOptions.Level.DataLength = 128;

            return loggerConfiguration.WriteTo.Fallible(
                sink => sink.MSSqlServer(
                    connectionString,
                    new MSSqlServerSinkOptions { TableName = LogTableName, AutoCreateSqlTable = false },
                    restrictedToMinimumLevel: minimumLevel,
                    columnOptions: columnOptions),
                new DatabaseLogFailureListener());
        }

        private static LoggerConfiguration WriteToPostgreSql(this LoggerConfiguration loggerConfiguration, string connectionString, LogEventLevel minimumLevel)
        {
            var columns = new Dictionary<string, ColumnWriterBase>
            {
                ["Message"] = new RenderedMessageColumnWriter(NpgsqlDbType.Text),
                ["MessageTemplate"] = new MessageTemplateColumnWriter(NpgsqlDbType.Text),
                ["Level"] = new LevelColumnWriter(true, NpgsqlDbType.Varchar),
                ["TimeStamp"] = new TimestampColumnWriter(NpgsqlDbType.TimestampTz),
                ["Exception"] = new ExceptionColumnWriter(NpgsqlDbType.Text),
                ["LogEvent"] = new LogEventSerializedColumnWriter(NpgsqlDbType.Text)
            };

            return loggerConfiguration.WriteTo.Fallible(
                sink => sink.PostgreSQL(
                    connectionString,
                    LogTableName,
                    columns,
                    restrictedToMinimumLevel: minimumLevel,
                    needAutoCreateTable: false),
                new DatabaseLogFailureListener());
        }

        /// <summary>
        /// Reports a failed write into the database, which Serilog otherwise drops without a word. It goes to the
        /// standard error output and not through the logger: the event would come back to the sink that has just failed.
        /// </summary>
        private sealed class DatabaseLogFailureListener : ILoggingFailureListener
        {
            public void OnLoggingFailed(object sender, LoggingFailureKind kind, string message, IReadOnlyCollection<LogEvent> events, Exception exception)
            {
                Console.Error.WriteLine(
                    "{0:u} Writing {1} log event(s) into the {2} table of {3} failed, Error Logs in the Admin UI will not show them: {4}",
                    DateTime.UtcNow, events?.Count ?? 0, LogTableName, AdminLogDbConnectionName, exception?.GetBaseException().Message ?? message);
            }
        }
    }
}
