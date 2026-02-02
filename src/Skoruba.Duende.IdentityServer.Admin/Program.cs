using Serilog;
using Skoruba.Duende.IdentityServer.Admin.Services;
using Skoruba.Duende.IdentityServer.Admin.UI.Services;
using Skoruba.Duende.IdentityServer.Admin.UI.Services.Configurations;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Helpers;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.ApplyDockerConfiguration();

builder.Configuration.AddAzureKeyVaultConfiguration(builder.Configuration);

builder.AddSerilog();

builder.Services.AddDataProtectionDbContext(builder.Configuration);

builder.Services.AddControllers();

builder.Services.AddAntiForgeryProtection();

builder.Services.AddAuthenticationConfiguration(builder.Configuration);

builder.Services.AddSkorubaAdminUI(options =>
{
    options.AdminConfiguration =
        builder.Configuration.GetSection(nameof(AdminConfiguration)).Get<AdminConfiguration>()!;
});

var app = builder.Build();

app.UseApplicationForwardHeaders(builder.Configuration);
app.UseApplicationSecurityHeaders();

app.UseSkorubaAdminUI();

app.UseStaticFiles();
app.UseSerilogRequestLogging();
app.UseRouting();
app.UseAntiForgeryProtection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllerRoute(name: "default", pattern: "{controller}/{action=Index}/{id?}");

app.UseEndpoints(_ => { });

app.Run();
