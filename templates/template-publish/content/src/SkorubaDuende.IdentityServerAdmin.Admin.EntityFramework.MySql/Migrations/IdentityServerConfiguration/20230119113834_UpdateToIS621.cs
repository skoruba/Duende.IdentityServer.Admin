using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql.Migrations.IdentityServerConfiguration
{
    public partial class UpdateToIS621 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CoordinateLifetimeWithUserSession",
                table: "Clients",
                type: "tinyint(1)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoordinateLifetimeWithUserSession",
                table: "Clients");
        }
    }
}








