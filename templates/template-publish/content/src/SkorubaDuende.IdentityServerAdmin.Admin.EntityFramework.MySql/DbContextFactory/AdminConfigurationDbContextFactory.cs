using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.DbContexts;

namespace SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql.DbContextFactory
{
    public class AdminConfigurationDbContextFactory : IDesignTimeDbContextFactory<AdminConfigurationDbContext>
    {
        public AdminConfigurationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AdminConfigurationDbContext>();

            var connectionString = Environment.GetEnvironmentVariable("ADMIN_CONFIGURATION_CONNECTION") ??
                                   "Server=localhost;Database=AdminConfiguration;User=root;Password=Password123!;TreatTinyAsBoolean=true;";

            optionsBuilder.UseMySql(
                connectionString,
                new MySqlServerVersion(new Version(8, 0, 36)),
                b => b.MigrationsAssembly(typeof(AdminConfigurationDbContextFactory).Assembly.GetName().Name));

            return new AdminConfigurationDbContext(optionsBuilder.Options);
        }
    }
}
