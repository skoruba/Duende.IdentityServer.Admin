using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer.Migrations.ConfigurationRules
{
    /// <inheritdoc />
    public partial class UpdateMessageTemplateWithParameters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 6,
                column: "MessageTemplate",
                value: "Access token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 6,
                column: "MessageTemplate",
                value: "Client access token lifetime exceeds recommended maximum");
        }
    }
}
