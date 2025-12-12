using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer.Migrations.ConfigurationRules
{
    /// <inheritdoc />
    public partial class SeedDefaultRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ConfigurationRules",
                columns: new[] { "Id", "Configuration", "CreatedAt", "FixDescription", "IsEnabled", "IssueType", "MessageTemplate", "ResourceType", "RuleType", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Go to the client details → Advanced → Grant Types and replace 'implicit' with 'authorization_code'.", true, 0, "Client uses obsolete implicit grant flow", 0, 0, null },
                    { 2, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Go to the client details → Advanced → Grant Types and replace 'password' with 'authorization_code' or 'client_credentials'.", true, 0, "Client uses obsolete password grant flow", 0, 1, null },
                    { 3, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "This client does not use PKCE. Consider enabling PKCE for enhanced security.", true, 1, "Client uses authorization code flow without PKCE", 0, 2, null },
                    { 4, "{\"allowLocalhost\": true}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Update redirect URIs to use HTTPS protocol. For production environments, HTTP is not secure.", false, 0, "Client has redirect URIs not using HTTPS", 0, 3, null },
                    { 5, "{\"prefix\": \"scope_\"}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Rename the API Scope to follow the naming convention starting with the required prefix.", false, 1, "API Scope name must start with specified prefix", 3, 7, null },
                    { 6, "{\"maxLifetimeSeconds\": 3600}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Go to client details → Token and reduce the Access Token Lifetime to the recommended maximum value.", false, 1, "Client access token lifetime exceeds recommended maximum", 0, 5, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 6);
        }
    }
}
