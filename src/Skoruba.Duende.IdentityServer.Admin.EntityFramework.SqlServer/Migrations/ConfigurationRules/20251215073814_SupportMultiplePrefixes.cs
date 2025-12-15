using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer.Migrations.ConfigurationRules
{
    /// <inheritdoc />
    public partial class SupportMultiplePrefixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Configuration", "FixDescription", "MessageTemplate" },
                values: new object[] { "{\"prefixes\": [\"scope_\"]}", "Rename the API Scope to follow the naming convention starting with one of the required prefixes.", "API Scope '{actualName}' must start with one of: {allowedPrefixes}" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Configuration", "FixDescription", "MessageTemplate" },
                values: new object[] { "{\"prefix\": \"scope_\"}", "Rename the API Scope to follow the naming convention starting with the required prefix.", "API Scope '{actualName}' must start with '{prefix}'" });
        }
    }
}
