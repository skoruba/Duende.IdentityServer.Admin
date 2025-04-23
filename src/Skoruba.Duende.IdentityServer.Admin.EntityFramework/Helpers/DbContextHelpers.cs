// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Helpers
{
    public static class DbContextHelpers
    {
        /// <summary>
        /// Get the table name of an entity in the given DbContext
        /// </summary>
        /// <typeparam name="TDbContext"></typeparam>
        /// <param name="serviceProvider"></param>
        /// <param name="entityTypeName">If specified, the full name of the type of the entity. 
        /// Otherwise, the first entity in the DbContext will be retrieved</param>
        /// <returns></returns>
        public static string GetEntityTable<TDbContext>(IServiceProvider serviceProvider, string entityTypeName = null)
            where TDbContext : DbContext
        {
            var db = serviceProvider.GetService<TDbContext>();
            if (db != null)
            {
                var entityType = entityTypeName != null ? db.Model.FindEntityType(entityTypeName) : db.Model.GetEntityTypes().FirstOrDefault();
                if (entityType != null)
                    return entityType.GetTableName();
            }

            return null;
        }

        /// <summary>
        /// Get the table schema of an entity in the given DbContext
        /// </summary>
        /// <typeparam name="TDbContext"></typeparam>
        /// <param name="serviceProvider"></param>
        /// <param name="entityTypeName">If specified, the full name of the type of the entity. 
        /// Otherwise, the first entity in the DbContext will be retrieved</param>
        /// <param name="systemDefaultSchemaName">The default schema name of the RDBMS, for example `dbo` for SQL Server</param>
        /// <returns></returns>
        public static string GetEntityTableSchema<TDbContext>(IServiceProvider serviceProvider, string entityTypeName = null, string systemDefaultSchemaName = null)
            where TDbContext : DbContext
        {
            var db = serviceProvider.GetService<TDbContext>();
            if (db != null)
            {
                var entityType = entityTypeName != null ? db.Model.FindEntityType(entityTypeName) : db.Model.GetEntityTypes().OrderBy(x => x.Name).FirstOrDefault();
                if (entityType != null)
                    return entityType.GetSchema() ?? entityType.GetDefaultSchema() ?? systemDefaultSchemaName;
            }

            return null;
        }
    }
}
