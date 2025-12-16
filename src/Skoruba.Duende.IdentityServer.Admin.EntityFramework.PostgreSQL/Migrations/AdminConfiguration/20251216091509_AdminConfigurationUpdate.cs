using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL.Migrations.AdminConfiguration
{
    /// <inheritdoc />
    public partial class AdminConfigurationUpdate : Migration
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
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                    { 1, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Advanced tab → Grant Types, remove 'implicit' and add 'authorization_code' instead.", true, 2, "Client uses obsolete implicit grant flow", 0, 0, null },
                    { 2, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Advanced tab → Grant Types, remove 'password' and add 'authorization_code' or 'client_credentials' instead.", true, 2, "Client uses obsolete password grant flow", 0, 1, null },
                    { 3, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Advanced tab → Authentication, scroll down and enable 'Require Proof Key for Code Exchange (PKCE)' toggle.", true, 0, "Client uses authorization code flow without PKCE", 0, 2, null },
                    { 4, "{\"minScopes\": 1}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Resources tab → Allowed Scopes section and add at least one scope from the available list.", true, 2, "Client '{clientName}' has {actualCount} allowed scope(s), but requires at least {requiredCount}", 0, 4, null },
                    { 5, "{\"minScopes\": 1}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to API Resource Details → Scopes section and add at least one scope to this API Resource.", true, 2, "API Resource '{resourceName}' has {actualCount} scope(s), but requires at least {requiredCount}", 2, 10, null },
                    { 6, "{\"allowLocalhost\": true}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → URLs tab → Redirect URIs section and update all HTTP URIs to use HTTPS protocol.", false, 2, "Client has {count} non-HTTPS redirect URI(s): {uris}", 0, 3, null },
                    { 7, "{\"maxLifetimeSeconds\": 3600}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Advanced tab → Token, find 'Access Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.", false, 0, "Access token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s", 0, 5, null },
                    { 8, "{\"maxLifetimeSeconds\": 2592000}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Advanced tab → Token, find 'Refresh Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.", false, 0, "Client '{clientName}' refresh token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s", 0, 6, null },
                    { 9, "{\"prefixes\": [\"scope_\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to API Scope Details → Basic Information section and rename the scope to start with one of the required prefixes: {allowedPrefixes}.", false, 0, "API Scope '{actualName}' must start with one of: {allowedPrefixes}", 3, 7, null },
                    { 10, "{\"forbiddenStrings\": [\"test\", \"temp\", \"debug\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to API Scope Details → Basic Information section and rename the scope to remove forbidden strings from the name.", false, 0, "API Scope '{scopeName}' contains forbidden string(s): {forbiddenStrings}", 3, 8, null },
                    { 11, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to API Scope Details → Basic Information section and add a user-friendly Display Name.", false, 1, "API Scope is missing a display name", 3, 9, null },
                    { 12, "{\"prefixes\": [\"api.\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to API Resource Details → Basic Information section and rename the resource to follow the naming convention.", false, 0, "API Resource '{actualName}' must start with one of: {allowedPrefixes}", 2, 11, null },
                    { 13, "{\"requiredResources\": [\"openid\", \"profile\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Identity Resource Details → Basic Information section and enable the 'Enabled' toggle.", false, 0, "Required identity resource '{resourceName}' ({displayName}) is disabled", 1, 12, null },
                    { 14, "{\"prefixes\": [\"custom.\"], \"excludeStandard\": true}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Identity Resource Details → Basic Information section and rename the resource to follow the naming convention.", false, 0, "Identity Resource '{actualName}' must start with one of: {allowedPrefixes}", 1, 13, null },
                    { 15, "{\"excludeScopes\": [\"openid\", \"profile\", \"email\", \"address\", \"phone\", \"offline_access\"]}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "This API Scope '{scopeName}' is not used by any clients or API resources. Consider removing it from API Scopes list or assigning it to relevant clients/resources.", false, 1, "API Scope '{scopeName}'{displayNameSuffix} is not used by any clients or API resources", 3, 14, null },
                    { 16, "{\"warningDays\": 30, \"includeAlreadyExpired\": true}", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Navigate to Client Details → Advanced tab → Authentication → Secrets section, remove the expired secret and add a new one with proper expiration date.", false, 0, "Client '{clientName}' has a secret ({secretType}) that {status} in {daysUntilExpiry} day(s) on {expirationDate}", 0, 15, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConfigurationRules_RuleType",
                table: "ConfigurationRules",
                column: "RuleType",
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
