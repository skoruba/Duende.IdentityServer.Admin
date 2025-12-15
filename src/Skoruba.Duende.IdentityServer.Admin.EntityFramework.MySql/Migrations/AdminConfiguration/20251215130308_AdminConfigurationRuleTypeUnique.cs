using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.MySql.Migrations.AdminConfiguration
{
    /// <inheritdoc />
    public partial class AdminConfigurationRuleTypeUnique : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ConfigurationRules_RuleType_ResourceType",
                table: "ConfigurationRules");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigurationRules_RuleType",
                table: "ConfigurationRules",
                column: "RuleType",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ConfigurationRules_RuleType",
                table: "ConfigurationRules");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigurationRules_RuleType_ResourceType",
                table: "ConfigurationRules",
                columns: new[] { "RuleType", "ResourceType" },
                unique: true);
        }
    }
}
