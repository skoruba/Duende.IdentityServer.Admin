using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL.Migrations.IdentityServerConfiguration
{
    public partial class UpdateToIS63 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "DPoPClockSkew",
                table: "Clients",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<int>(
                name: "DPoPValidationMode",
                table: "Clients",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "InitiateLoginUri",
                table: "Clients",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequireDPoP",
                table: "Clients",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DPoPClockSkew",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "DPoPValidationMode",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "InitiateLoginUri",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "RequireDPoP",
                table: "Clients");
        }
    }
}
