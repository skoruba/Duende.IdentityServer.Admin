using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL.Migrations.AuditLogging
{
    /// <inheritdoc />
    public partial class AddAuditLogCreatedIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Not CreateIndex: on a large log the index may have been built ahead of the upgrade
            // (e.g. CONCURRENTLY), and the migration then has to leave it alone.
            migrationBuilder.Sql(@"CREATE INDEX IF NOT EXISTS ""IX_AuditLog_Created"" ON ""AuditLog"" (""Created"");");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AuditLog_Created",
                table: "AuditLog");
        }
    }
}
