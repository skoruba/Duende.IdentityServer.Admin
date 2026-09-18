using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer.Migrations.AdminConfiguration
{
    /// <inheritdoc />
    public partial class AddNamingScopeAndFapiRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ConfigurationRules",
                columns: new[] { "Id", "Configuration", "CreatedAt", "FixDescription", "IsEnabled", "IssueType", "MessageTemplate", "ResourceType", "RuleType", "UpdatedAt" },
                values: new object[,]
                {
                    { 17, "{\"prefixes\": [\"Client \"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Basics tab and rename the client to start with one of the required prefixes: {allowedPrefixes}.", false, 0, "Client '{actualName}' must start with one of: {allowedPrefixes}", 0, 16, null },
                    { 18, "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Basics tab and rename the client to remove forbidden strings from the name.", false, 0, "Client '{clientName}' contains forbidden string(s): {forbiddenStrings}", 0, 17, null },
                    { 19, "{\"prefixes\": [\"client_\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Basics tab and rename the Client ID to start with one of the required prefixes: {allowedPrefixes}.", false, 0, "Client ID '{actualClientId}' must start with one of: {allowedPrefixes}", 0, 18, null },
                    { 20, "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Basics tab and rename the Client ID to remove forbidden strings from it.", false, 0, "Client ID '{clientId}' contains forbidden string(s): {forbiddenStrings}", 0, 19, null },
                    { 21, "{\"excludeScopes\": [\"offline_access\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Resources tab → Allowed Scopes section and remove the scope(s) that no longer exist: {missingScopes}.", false, 0, "Client '{clientName}' allows {count} scope(s) that no longer exist: {missingScopes}", 0, 20, null },
                    { 22, "{\"allowedAlgorithms\": [\"PS256\", \"ES256\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Advanced tab → Token → Identity Token, find 'Allowed Identity Token Signing Algorithms' field and keep only {allowedAlgorithms}. If a JWK secret carries an algorithm outside this deployment's allow-list, regenerate the key in Client Details → Secrets tab and update the client application.", false, 0, "Client '{clientName}' uses {count} signing algorithm(s) outside this deployment's FAPI 2.0 allow-list: {algorithms}", 0, 21, null },
                    { 23, "{\"allowedAlgorithms\": [\"PS256\", \"ES256\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to API Resource Details → Basic Information section, find 'Allowed Access Token Signing Algorithms' field and keep only {allowedAlgorithms}.", false, 0, "API Resource '{resourceName}' allows {count} access token signing algorithm(s) outside this deployment's FAPI 2.0 allow-list: {algorithms}", 2, 22, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 23);
        }
    }
}
