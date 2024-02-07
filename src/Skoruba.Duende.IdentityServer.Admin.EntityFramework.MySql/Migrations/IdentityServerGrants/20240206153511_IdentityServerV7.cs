using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.MySql.Migrations.IdentityServerGrants
{
    /// <inheritdoc />
    public partial class IdentityServerV7 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE ServerSideSessions MODIFY id INT NOT NULL;
            ALTER TABLE ServerSideSessions DROP PRIMARY KEY;
            ALTER TABLE ServerSideSessions MODIFY Id BIGINT NOT NULL PRIMARY KEY AUTO_INCREMENT;");
            
            migrationBuilder.CreateTable(
                    name: "PushedAuthorizationRequests",
                    columns: table => new
                    {
                        Id = table.Column<long>(type: "bigint", nullable: false)
                            .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                        ReferenceValueHash = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        ExpiresAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                        Parameters = table.Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4")
                    },
                    constraints: table => { table.PrimaryKey("PK_PushedAuthorizationRequests", x => x.Id); })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PushedAuthorizationRequests_ExpiresAtUtc",
                table: "PushedAuthorizationRequests",
                column: "ExpiresAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_PushedAuthorizationRequests_ReferenceValueHash",
                table: "PushedAuthorizationRequests",
                column: "ReferenceValueHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PushedAuthorizationRequests");

            migrationBuilder.Sql(@"ALTER TABLE ServerSideSessions MODIFY id BIGINT NOT NULL;
            ALTER TABLE ServerSideSessions DROP PRIMARY KEY;
            ALTER TABLE ServerSideSessions MODIFY Id INT NOT NULL PRIMARY KEY AUTO_INCREMENT;");
        }
    }
}