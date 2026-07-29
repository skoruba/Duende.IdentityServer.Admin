using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL.Migrations.AdminConfiguration
{
    /// <inheritdoc />
    public partial class AddClientScopeMustExistRule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ConfigurationRules",
                columns: new[] { "Id", "Configuration", "CreatedAt", "FixDescription", "IsEnabled", "IssueType", "MessageTemplate", "ResourceType", "RuleType", "UpdatedAt" },
                values: new object[] { 21, "{\"excludeScopes\": [\"offline_access\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Resources tab → Allowed Scopes section and remove the scope(s) that no longer exist: {missingScopes}.", false, 0, "Client '{clientName}' allows {count} scope(s) that no longer exist: {missingScopes}", 0, 20, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 21);
        }
    }
}
