param([string] $migration = 'DbInit', [string] $migrationProviderName = 'All', [string] $targetContext = 'All', [string] $projectName = 'Skoruba.Duende.IdentityServer')
$currentPath = Get-Location
Set-Location "../src/$projectName.Admin.Api"
Copy-Item appsettings.json -Destination appsettings-backup.json
$settings = Get-Content appsettings.json -raw

#Initialze db context and define the target directory
$targetContexts = @{ 
    AdminIdentityDbContext                = "Migrations/Identity"
    AdminLogDbContext                     = "Migrations/Logging";
    IdentityServerConfigurationDbContext  = "Migrations/IdentityServerConfiguration";
    IdentityServerPersistedGrantDbContext = "Migrations/IdentityServerGrants";
    AdminAuditLogDbContext                = "Migrations/AuditLogging";
    IdentityServerDataProtectionDbContext = "Migrations/DataProtection";
}

#Initialize the db providers and it's respective projects
$dpProviders = @{
    SqlServer  = "..\..\src\$projectName.Admin.EntityFramework.SqlServer\$projectName.Admin.EntityFramework.SqlServer.csproj";
    PostgreSQL = "..\..\src\$projectName.Admin.EntityFramework.PostgreSQL\$projectName.Admin.EntityFramework.PostgreSQL.csproj";
    MySql      = "..\..\src\$projectName.Admin.EntityFramework.MySql\$projectName.Admin.EntityFramework.MySql.csproj";
}

Write-Host "Start migrate projects"
foreach ($provider in $dpProviders.Keys) {

    if ($migrationProviderName -eq 'All' -or $migrationProviderName -eq $provider) {
    
        $projectPath = (Get-Item -Path $dpProviders[$provider] -Verbose).FullName;
        Write-Host "Generate migration for db provider:" $provider ", for project path - " $projectPath

        $providerName = '"ProviderType": "' + $provider + '"'

        $settings = $settings -replace '"ProviderType".*', $providerName
        $settings | set-content appsettings.json
        if ((Test-Path $projectPath) -eq $true) {
            foreach ($context in $targetContexts.Keys) {
                
                if ($targetContext -eq 'All' -or $context -eq $targetContext) {

                    $migrationPath = $targetContexts[$context];

                    Write-Host "Migrating context " $context
                    dotnet ef migrations add $migration -c $context -o $migrationPath -p $projectPath
                }
            } 
        }
        
    }
}

Remove-Item appsettings.json
Copy-Item appsettings-backup.json -Destination appsettings.json
Remove-Item appsettings-backup.json
Set-Location $currentPath
