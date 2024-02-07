using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer.Migrations.IdentityServerConfiguration
{
    public partial class UpdateToIS61 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CoordinateLifetimeWithUserSession",
                table: "Clients",
                type: "bit",
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








