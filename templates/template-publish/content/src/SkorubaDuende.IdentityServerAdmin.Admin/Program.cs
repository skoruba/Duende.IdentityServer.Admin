using Serilog;
using SkorubaDuende.IdentityServerAdmin.Admin.Services;
using Skoruba.Duende.IdentityServer.Admin.UI.Services;
using Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Helpers;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.ApplyDockerConfiguration();

builder.Configuration.AddAzureKeyVaultConfiguration(builder.Configuration);

builder.AddSerilog();

builder.Services.AddDataProtectionDbContext(builder.Configuration);

builder.Services.AddControllers();

builder.Services.AddAuthenticationConfiguration(builder.Configuration);

builder.Services.AddSkorubaAdminUI(options =>
{
    options.AdminConfiguration =
        builder.Configuration.GetSection(nameof(AdminConfiguration)).Get<AdminConfiguration>()!;
});

var app = builder.Build();

app.UseApplicationForwardHeaders();
app.UseApplicationSecurityHeaders();

app.UseStaticFiles();
app.UseSerilogRequestLogging();
app.UseRouting();
app.UseAntiForgeryProtection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllerRoute(name: "default", pattern: "{controller}/{action=Index}/{id?}");

app.UseSkorubaAdminUI();

app.UseEndpoints(_ => { });
app.MapFallbackToFile("/index.html");

app.Run();