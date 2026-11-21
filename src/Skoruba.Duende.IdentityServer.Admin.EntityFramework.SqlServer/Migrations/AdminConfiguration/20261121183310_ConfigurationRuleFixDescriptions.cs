using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer.Migrations.AdminConfiguration
{
    /// <inheritdoc />
    public partial class ConfigurationRuleFixDescriptions : Migration
    {
        // The fix descriptions of these built-in rules pointed to tabs the Admin UI does not have.
        // The update goes by the rule type and the old default text instead of by the Id of the
        // seeded row: a rule deleted and created again, or added by ApplyConfigurationRulesSeed,
        // gets the new text too, and a text an administrator changed stays as it is.
        private static readonly (string RuleType, string OldFixDescription, string NewFixDescription)[] FixDescriptions =
        [
            ("MissingPkce",
                "Navigate to Client Details → Advanced tab → Authentication, scroll down and enable 'Require Proof Key for Code Exchange (PKCE)' toggle.",
                "Navigate to Client Details → Advanced tab → Authorization → PKCE and enable the 'Require Pkce' toggle."),
            ("ClientMustHaveScopes",
                "Navigate to Client Details → Resources tab → Allowed Scopes section and add at least one scope from the available list.",
                "Navigate to Client Details → Scopes tab → Allowed Scopes and add at least one scope from the available list."),
            ("ClientAccessTokenLifetimeTooLong",
                "Navigate to Client Details → Advanced tab → Token, find 'Access Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.",
                "Navigate to Client Details → Advanced tab → Tokens → Access Token, find 'Access Token Lifetime' field and reduce the value to {maxLifetime} seconds or less."),
            ("ClientRefreshTokenLifetimeTooLong",
                "Navigate to Client Details → Advanced tab → Token, find 'Refresh Token Lifetime' field and reduce the value to {maxLifetime} seconds or less.",
                "Navigate to Client Details → Advanced tab → Tokens → Refresh Token, find 'Absolute Refresh Token Lifetime' field and reduce the value to {maxLifetime} seconds or less."),
            ("ApiScopeNameMustStartWith",
                "Navigate to API Scope Details → Basic Information section and rename the scope to start with one of the required prefixes: {allowedPrefixes}.",
                "Navigate to API Scope Details → Basics tab and rename the scope to start with one of the required prefixes: {allowedPrefixes}."),
            ("ApiScopeNameMustNotContain",
                "Navigate to API Scope Details → Basic Information section and rename the scope to remove forbidden strings from the name.",
                "Navigate to API Scope Details → Basics tab and rename the scope to remove forbidden strings from the name."),
            ("ApiScopeMustHaveDisplayName",
                "Navigate to API Scope Details → Basic Information section and add a user-friendly Display Name.",
                "Navigate to API Scope Details → Basics tab and add a user-friendly Display Name."),
            ("ApiResourceMustHaveScopes",
                "Navigate to API Resource Details → Scopes section and add at least one scope to this API Resource.",
                "Navigate to API Resource Details → Scopes tab and add at least one scope to this API Resource."),
            ("ApiResourceNameMustStartWith",
                "Navigate to API Resource Details → Basic Information section and rename the resource to follow the naming convention.",
                "Navigate to API Resource Details → Basics tab and rename the resource to follow the naming convention."),
            ("IdentityResourceMustBeEnabled",
                "Navigate to Identity Resource Details → Basic Information section and enable the 'Enabled' toggle.",
                "Navigate to Identity Resource Details → Basics tab and enable the 'Enabled' toggle."),
            ("IdentityResourceNameMustStartWith",
                "Navigate to Identity Resource Details → Basic Information section and rename the resource to follow the naming convention.",
                "Navigate to Identity Resource Details → Basics tab and rename the resource to follow the naming convention."),
            ("SecretIsExpiredInDays",
                "Navigate to Client Details → Advanced tab → Authentication → Secrets section, remove the expired secret and add a new one with proper expiration date.",
                "Navigate to Client Details → Secrets tab, remove the expired secret and add a new one with proper expiration date."),
            ("ClientScopeMustExist",
                "Navigate to Client Details → Resources tab → Allowed Scopes section and remove the scope(s) that no longer exist: {missingScopes}.",
                "Navigate to Client Details → Scopes tab → Allowed Scopes and remove the scope(s) that no longer exist: {missingScopes}."),
            ("ClientSigningAlgorithmsMustBeFapiCompliant",
                "Navigate to Client Details → Advanced tab → Token → Identity Token, find 'Allowed Identity Token Signing Algorithms' field and keep only {allowedAlgorithms}. If a JWK secret carries an algorithm outside this deployment's allow-list, regenerate the key in Client Details → Secrets tab and update the client application.",
                "Navigate to Client Details → Advanced tab → Tokens → Identity Token, find 'Allowed Identity Token Signing Algorithms' field and keep only {allowedAlgorithms}. If a JWK secret carries an algorithm outside this deployment's allow-list, regenerate the key in Client Details → Secrets tab and update the client application."),
            ("ApiResourceSigningAlgorithmsMustBeFapiCompliant",
                "Navigate to API Resource Details → Basic Information section, find 'Allowed Access Token Signing Algorithms' field and keep only {allowedAlgorithms}.",
                "Navigate to API Resource Details → Basics tab, find 'Allowed Access Token Signing Algorithms' field and keep only {allowedAlgorithms}.")
        ];

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (var (ruleType, oldFixDescription, newFixDescription) in FixDescriptions)
            {
                UpdateFixDescription(migrationBuilder, ruleType, from: oldFixDescription, to: newFixDescription);
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var (ruleType, oldFixDescription, newFixDescription) in FixDescriptions)
            {
                UpdateFixDescription(migrationBuilder, ruleType, from: newFixDescription, to: oldFixDescription);
            }
        }

        private static void UpdateFixDescription(MigrationBuilder migrationBuilder, string ruleType, string from, string to)
        {
            migrationBuilder.Sql($"UPDATE [ConfigurationRules] SET [FixDescription] = N'{Quote(to)}' WHERE [RuleType] = N'{ruleType}' AND [FixDescription] = N'{Quote(from)}';");
        }

        private static string Quote(string value) => value.Replace("'", "''");
    }
}
