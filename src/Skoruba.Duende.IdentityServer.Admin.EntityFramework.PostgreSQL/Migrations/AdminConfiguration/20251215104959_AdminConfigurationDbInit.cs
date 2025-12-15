using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL.Migrations.AdminConfiguration
{
    /// <inheritdoc />
    public partial class AdminConfigurationDbInit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfigurationRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RuleType = table.Column<int>(type: "integer", nullable: false),
                    ResourceType = table.Column<int>(type: "integer", nullable: false),
                    IssueType = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    MessageTemplate = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    FixDescription = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfigurationRules", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ConfigurationRules",
                columns: new[] { "Id", "Configuration", "CreatedAt", "FixDescription", "IsEnabled", "IssueType", "MessageTemplate", "ResourceType", "RuleType", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Go to the client details → Advanced → Grant Types and replace 'implicit' with 'authorization_code'.", true, 0, "Client uses obsolete implicit grant flow", 0, 0, null },
                    { 2, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Go to the client details → Advanced → Grant Types and replace 'password' with 'authorization_code' or 'client_credentials'.", true, 0, "Client uses obsolete password grant flow", 0, 1, null },
                    { 3, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "This client does not use PKCE. Consider enabling PKCE for enhanced security.", true, 1, "Client uses authorization code flow without PKCE", 0, 2, null },
                    { 4, "{\"allowLocalhost\": true}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Update redirect URIs to use HTTPS protocol. For production environments, HTTP is not secure.", false, 0, "Client has {count} non-HTTPS redirect URI(s): {uris}", 0, 3, null },
                    { 5, "{\"prefixes\": [\"scope_\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Rename the API Scope to follow the naming convention starting with one of the required prefixes.", false, 1, "API Scope '{actualName}' must start with one of: {allowedPrefixes}", 3, 7, null },
                    { 6, "{\"maxLifetimeSeconds\": 3600}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Go to client details → Token and reduce the Access Token Lifetime to the recommended maximum value.", false, 1, "Access token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s", 0, 5, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConfigurationRules_RuleType_ResourceType",
                table: "ConfigurationRules",
                columns: new[] { "RuleType", "ResourceType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfigurationRules");
        }
    }
}
