using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL.Migrations.IdentityServerConfiguration
{
    /// <inheritdoc />
    public partial class IdentityServerV8 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SamlServiceProviders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EntityId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    ClockSkewSeconds = table.Column<double>(type: "double precision", nullable: true),
                    RequestMaxAgeSeconds = table.Column<double>(type: "double precision", nullable: true),
                    AssertionLifetimeSeconds = table.Column<double>(type: "double precision", nullable: true),
                    RequireSignedAuthnRequests = table.Column<bool>(type: "boolean", nullable: true),
                    RequireSignedLogoutResponses = table.Column<bool>(type: "boolean", nullable: true),
                    AllowIdpInitiated = table.Column<bool>(type: "boolean", nullable: false),
                    DefaultNameIdFormat = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    EmailNameIdClaimType = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SigningBehavior = table.Column<int>(type: "integer", nullable: true),
                    AllowedSignatureAlgorithms = table.Column<List<string>>(type: "text[]", nullable: true),
                    Created = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Updated = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LastAccessed = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    NonEditable = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SamlServiceProviders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SamlAllowedScopes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Scope = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SamlServiceProviderId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SamlAllowedScopes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SamlAllowedScopes_SamlServiceProviders_SamlServiceProviderId",
                        column: x => x.SamlServiceProviderId,
                        principalTable: "SamlServiceProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SamlAssertionConsumerServices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Location = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    Binding = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Index = table.Column<int>(type: "integer", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    SamlServiceProviderId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SamlAssertionConsumerServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SamlAssertionConsumerServices_SamlServiceProviders_SamlServ~",
                        column: x => x.SamlServiceProviderId,
                        principalTable: "SamlServiceProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SamlAuthnContextMappings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OidcValue = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    SamlAuthnContextClassRef = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SamlServiceProviderId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SamlAuthnContextMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SamlAuthnContextMappings_SamlServiceProviders_SamlServicePr~",
                        column: x => x.SamlServiceProviderId,
                        principalTable: "SamlServiceProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SamlCertificates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Data = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Use = table.Column<int>(type: "integer", nullable: false),
                    SamlServiceProviderId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SamlCertificates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SamlCertificates_SamlServiceProviders_SamlServiceProviderId",
                        column: x => x.SamlServiceProviderId,
                        principalTable: "SamlServiceProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SamlClaimMappings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClaimType = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    SamlAttributeName = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    SamlServiceProviderId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SamlClaimMappings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SamlClaimMappings_SamlServiceProviders_SamlServiceProviderId",
                        column: x => x.SamlServiceProviderId,
                        principalTable: "SamlServiceProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SamlRequestedClaimTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClaimType = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    SamlServiceProviderId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SamlRequestedClaimTypes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SamlRequestedClaimTypes_SamlServiceProviders_SamlServicePro~",
                        column: x => x.SamlServiceProviderId,
                        principalTable: "SamlServiceProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SamlSingleLogoutServices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Location = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    Binding = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SamlServiceProviderId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SamlSingleLogoutServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SamlSingleLogoutServices_SamlServiceProviders_SamlServicePr~",
                        column: x => x.SamlServiceProviderId,
                        principalTable: "SamlServiceProviders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SamlAllowedScopes_SamlServiceProviderId_Scope",
                table: "SamlAllowedScopes",
                columns: new[] { "SamlServiceProviderId", "Scope" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SamlAssertionConsumerServices_SamlServiceProviderId_Location",
                table: "SamlAssertionConsumerServices",
                columns: new[] { "SamlServiceProviderId", "Location" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SamlAuthnContextMappings_SamlServiceProviderId_OidcValue",
                table: "SamlAuthnContextMappings",
                columns: new[] { "SamlServiceProviderId", "OidcValue" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SamlCertificates_SamlServiceProviderId",
                table: "SamlCertificates",
                column: "SamlServiceProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_SamlClaimMappings_SamlServiceProviderId_ClaimType",
                table: "SamlClaimMappings",
                columns: new[] { "SamlServiceProviderId", "ClaimType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SamlRequestedClaimTypes_SamlServiceProviderId_ClaimType",
                table: "SamlRequestedClaimTypes",
                columns: new[] { "SamlServiceProviderId", "ClaimType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SamlServiceProviders_EntityId",
                table: "SamlServiceProviders",
                column: "EntityId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SamlSingleLogoutServices_SamlServiceProviderId_Binding",
                table: "SamlSingleLogoutServices",
                columns: new[] { "SamlServiceProviderId", "Binding" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SamlAllowedScopes");

            migrationBuilder.DropTable(
                name: "SamlAssertionConsumerServices");

            migrationBuilder.DropTable(
                name: "SamlAuthnContextMappings");

            migrationBuilder.DropTable(
                name: "SamlCertificates");

            migrationBuilder.DropTable(
                name: "SamlClaimMappings");

            migrationBuilder.DropTable(
                name: "SamlRequestedClaimTypes");

            migrationBuilder.DropTable(
                name: "SamlSingleLogoutServices");

            migrationBuilder.DropTable(
                name: "SamlServiceProviders");
        }
    }
}
