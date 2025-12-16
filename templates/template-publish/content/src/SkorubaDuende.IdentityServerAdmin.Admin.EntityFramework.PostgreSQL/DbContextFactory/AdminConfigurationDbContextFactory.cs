using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.DbContexts;

namespace SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL.DbContextFactory
{
    public class AdminConfigurationDbContextFactory : IDesignTimeDbContextFactory<AdminConfigurationDbContext>
    {
        public AdminConfigurationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AdminConfigurationDbContext>();

            var connectionString = Environment.GetEnvironmentVariable("ADMIN_CONFIGURATION_CONNECTION") ??
                                   "Host=localhost;Database=AdminConfiguration;Username=postgres;Password=Password123!";

            optionsBuilder.UseNpgsql(
                connectionString,
                b => b.MigrationsAssembly(typeof(AdminConfigurationDbContextFactory).Assembly.GetName().Name));

            return new AdminConfigurationDbContext(optionsBuilder.Options);
        }
    }
}
