using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer.Migrations.AuditLogging
{
    /// <inheritdoc />
    public partial class AddAuditLogCreatedIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Not CreateIndex: on a large log the index may have been built ahead of the upgrade
            // (e.g. WITH (ONLINE = ON) on Azure SQL), and the migration then has to leave it alone.
            migrationBuilder.Sql(@"
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_AuditLog_Created' AND object_id = OBJECT_ID(N'[AuditLog]'))
    CREATE INDEX [IX_AuditLog_Created] ON [AuditLog] ([Created]);");
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
