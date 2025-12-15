using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.MySql.Migrations.AdminConfiguration
{
    /// <inheritdoc />
    public partial class AdminConfigurationSeedUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ConfigurationRules",
                columns: new[] { "Id", "Configuration", "CreatedAt", "FixDescription", "IsEnabled", "IssueType", "MessageTemplate", "ResourceType", "RuleType", "UpdatedAt" },
                values: new object[,]
                {
                    { 7, "{\"minScopes\": 1}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Go to client details → Scopes and add allowed scopes.", true, 0, "Client '{clientName}' has {actualCount} allowed scope(s), but requires at least {requiredCount}", 0, 4, null },
                    { 8, "{\"minScopes\": 1}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Go to API Resource details → Scopes and add at least one scope.", true, 0, "API Resource '{resourceName}' has {actualCount} scope(s), but requires at least {requiredCount}", 2, 10, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 8);
        }
    }
}
