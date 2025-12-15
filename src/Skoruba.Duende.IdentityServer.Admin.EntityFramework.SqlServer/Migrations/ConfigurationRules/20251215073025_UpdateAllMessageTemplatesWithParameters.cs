using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer.Migrations.ConfigurationRules
{
    /// <inheritdoc />
    public partial class UpdateAllMessageTemplatesWithParameters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 4,
                column: "MessageTemplate",
                value: "Client has {count} non-HTTPS redirect URI(s): {uris}");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 5,
                column: "MessageTemplate",
                value: "API Scope '{actualName}' must start with '{prefix}'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 4,
                column: "MessageTemplate",
                value: "Client has redirect URIs not using HTTPS");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 5,
                column: "MessageTemplate",
                value: "API Scope name must start with specified prefix");
        }
    }
}
