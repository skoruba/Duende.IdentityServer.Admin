using Microsoft.EntityFrameworkCore.Migrations;

namespace SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL.Migrations.IdentityServerConfiguration
{
    public partial class AddRequireResourceIndicator : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RequireResourceIndicator",
                table: "ApiResources",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequireResourceIndicator",
                table: "ApiResources");
        }
    }
}








