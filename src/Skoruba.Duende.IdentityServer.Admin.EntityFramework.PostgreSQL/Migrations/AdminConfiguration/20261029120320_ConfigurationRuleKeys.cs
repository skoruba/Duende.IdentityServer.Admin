using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL.Migrations.AdminConfiguration
{
    /// <inheritdoc />
    public partial class ConfigurationRuleKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "RuleType",
                table: "ConfigurationRules",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            // The column now holds the former enum numbers as text. Rows seeded by HasData are
            // updated below by Id; this covers rules an administrator deleted and created again,
            // which live under other Ids. A number no built-in rule had (a custom rule) stays as it is.
            migrationBuilder.Sql(@"UPDATE ""ConfigurationRules"" SET ""RuleType"" = CASE ""RuleType""
                WHEN '0' THEN 'ObsoleteImplicitGrant'
                WHEN '1' THEN 'ObsoletePasswordGrant'
                WHEN '2' THEN 'MissingPkce'
                WHEN '3' THEN 'ClientRedirectUrisMustUseHttps'
                WHEN '4' THEN 'ClientMustHaveScopes'
                WHEN '5' THEN 'ClientAccessTokenLifetimeTooLong'
                WHEN '6' THEN 'ClientRefreshTokenLifetimeTooLong'
                WHEN '7' THEN 'ApiScopeNameMustStartWith'
                WHEN '8' THEN 'ApiScopeNameMustNotContain'
                WHEN '9' THEN 'ApiScopeMustHaveDisplayName'
                WHEN '10' THEN 'ApiResourceMustHaveScopes'
                WHEN '11' THEN 'ApiResourceNameMustStartWith'
                WHEN '12' THEN 'IdentityResourceMustBeEnabled'
                WHEN '13' THEN 'IdentityResourceNameMustStartWith'
                WHEN '14' THEN 'ScopeIsUnused'
                WHEN '15' THEN 'SecretIsExpiredInDays'
                WHEN '16' THEN 'ClientNameMustStartWith'
                WHEN '17' THEN 'ClientNameMustNotContain'
                WHEN '18' THEN 'ClientIdMustStartWith'
                WHEN '19' THEN 'ClientIdMustNotContain'
                WHEN '20' THEN 'ClientScopeMustExist'
                WHEN '21' THEN 'ClientSigningAlgorithmsMustBeFapiCompliant'
                WHEN '22' THEN 'ApiResourceSigningAlgorithmsMustBeFapiCompliant'
                ELSE ""RuleType"" END;");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 1,
                column: "RuleType",
                value: "ObsoleteImplicitGrant");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 2,
                column: "RuleType",
                value: "ObsoletePasswordGrant");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 3,
                column: "RuleType",
                value: "MissingPkce");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 4,
                column: "RuleType",
                value: "ClientMustHaveScopes");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 5,
                column: "RuleType",
                value: "ApiResourceMustHaveScopes");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 6,
                column: "RuleType",
                value: "ClientRedirectUrisMustUseHttps");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 7,
                column: "RuleType",
                value: "ClientAccessTokenLifetimeTooLong");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 8,
                column: "RuleType",
                value: "ClientRefreshTokenLifetimeTooLong");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 9,
                column: "RuleType",
                value: "ApiScopeNameMustStartWith");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 10,
                column: "RuleType",
                value: "ApiScopeNameMustNotContain");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 11,
                column: "RuleType",
                value: "ApiScopeMustHaveDisplayName");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 12,
                column: "RuleType",
                value: "ApiResourceNameMustStartWith");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 13,
                column: "RuleType",
                value: "IdentityResourceMustBeEnabled");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 14,
                column: "RuleType",
                value: "IdentityResourceNameMustStartWith");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 15,
                column: "RuleType",
                value: "ScopeIsUnused");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 16,
                column: "RuleType",
                value: "SecretIsExpiredInDays");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 17,
                column: "RuleType",
                value: "ClientNameMustStartWith");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 18,
                column: "RuleType",
                value: "ClientNameMustNotContain");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 19,
                column: "RuleType",
                value: "ClientIdMustStartWith");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 20,
                column: "RuleType",
                value: "ClientIdMustNotContain");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 21,
                column: "RuleType",
                value: "ClientScopeMustExist");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 22,
                column: "RuleType",
                value: "ClientSigningAlgorithmsMustBeFapiCompliant");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 23,
                column: "RuleType",
                value: "ApiResourceSigningAlgorithmsMustBeFapiCompliant");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Names back to the enum numbers, then the column narrows to integer. PostgreSQL has no
            // assignment cast from text to integer, so the scaffolded AlterColumn is replaced by an
            // ALTER with USING. A custom key that is not a number has no place in the old column,
            // so the revert stops instead of failing half-way in the conversion.
            migrationBuilder.Sql(@"DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM ""ConfigurationRules"" WHERE ""RuleType"" NOT IN ('ObsoleteImplicitGrant', 'ObsoletePasswordGrant', 'MissingPkce', 'ClientRedirectUrisMustUseHttps', 'ClientMustHaveScopes', 'ClientAccessTokenLifetimeTooLong', 'ClientRefreshTokenLifetimeTooLong', 'ApiScopeNameMustStartWith', 'ApiScopeNameMustNotContain', 'ApiScopeMustHaveDisplayName', 'ApiResourceMustHaveScopes', 'ApiResourceNameMustStartWith', 'IdentityResourceMustBeEnabled', 'IdentityResourceNameMustStartWith', 'ScopeIsUnused', 'SecretIsExpiredInDays', 'ClientNameMustStartWith', 'ClientNameMustNotContain', 'ClientIdMustStartWith', 'ClientIdMustNotContain', 'ClientScopeMustExist', 'ClientSigningAlgorithmsMustBeFapiCompliant', 'ApiResourceSigningAlgorithmsMustBeFapiCompliant') AND ""RuleType"" !~ '^[0-9]+$') THEN
                    RAISE EXCEPTION 'ConfigurationRules holds a custom rule key that is not a number and cannot go back into the integer column. Delete those rules before reverting the ConfigurationRuleKeys migration.';
                END IF;
            END $$;
            UPDATE ""ConfigurationRules"" SET ""RuleType"" = CASE ""RuleType""
                WHEN 'ObsoleteImplicitGrant' THEN '0'
                WHEN 'ObsoletePasswordGrant' THEN '1'
                WHEN 'MissingPkce' THEN '2'
                WHEN 'ClientRedirectUrisMustUseHttps' THEN '3'
                WHEN 'ClientMustHaveScopes' THEN '4'
                WHEN 'ClientAccessTokenLifetimeTooLong' THEN '5'
                WHEN 'ClientRefreshTokenLifetimeTooLong' THEN '6'
                WHEN 'ApiScopeNameMustStartWith' THEN '7'
                WHEN 'ApiScopeNameMustNotContain' THEN '8'
                WHEN 'ApiScopeMustHaveDisplayName' THEN '9'
                WHEN 'ApiResourceMustHaveScopes' THEN '10'
                WHEN 'ApiResourceNameMustStartWith' THEN '11'
                WHEN 'IdentityResourceMustBeEnabled' THEN '12'
                WHEN 'IdentityResourceNameMustStartWith' THEN '13'
                WHEN 'ScopeIsUnused' THEN '14'
                WHEN 'SecretIsExpiredInDays' THEN '15'
                WHEN 'ClientNameMustStartWith' THEN '16'
                WHEN 'ClientNameMustNotContain' THEN '17'
                WHEN 'ClientIdMustStartWith' THEN '18'
                WHEN 'ClientIdMustNotContain' THEN '19'
                WHEN 'ClientScopeMustExist' THEN '20'
                WHEN 'ClientSigningAlgorithmsMustBeFapiCompliant' THEN '21'
                WHEN 'ApiResourceSigningAlgorithmsMustBeFapiCompliant' THEN '22'
                ELSE ""RuleType"" END;
            ALTER TABLE ""ConfigurationRules"" ALTER COLUMN ""RuleType"" TYPE integer USING ""RuleType""::integer;");

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 1,
                column: "RuleType",
                value: 0);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 2,
                column: "RuleType",
                value: 1);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 3,
                column: "RuleType",
                value: 2);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 4,
                column: "RuleType",
                value: 4);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 5,
                column: "RuleType",
                value: 10);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 6,
                column: "RuleType",
                value: 3);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 7,
                column: "RuleType",
                value: 5);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 8,
                column: "RuleType",
                value: 6);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 9,
                column: "RuleType",
                value: 7);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 10,
                column: "RuleType",
                value: 8);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 11,
                column: "RuleType",
                value: 9);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 12,
                column: "RuleType",
                value: 11);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 13,
                column: "RuleType",
                value: 12);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 14,
                column: "RuleType",
                value: 13);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 15,
                column: "RuleType",
                value: 14);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 16,
                column: "RuleType",
                value: 15);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 17,
                column: "RuleType",
                value: 16);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 18,
                column: "RuleType",
                value: 17);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 19,
                column: "RuleType",
                value: 18);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 20,
                column: "RuleType",
                value: 19);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 21,
                column: "RuleType",
                value: 20);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 22,
                column: "RuleType",
                value: 21);

            migrationBuilder.UpdateData(
                table: "ConfigurationRules",
                keyColumn: "Id",
                keyValue: 23,
                column: "RuleType",
                value: 22);
        }
    }
}
