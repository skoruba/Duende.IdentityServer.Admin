param([string] $packagesVersions, [string]$gitBranchName = 'dev')

# This script contains following steps:
# - Download latest version of Skoruba.Duende.IdentityServer.Admin from git repository
# - Use folders src and tests for project template

#$gitProject = "https://github.com/skoruba/Duende.IdentityServer.Admin"
$gitProjectFolder = "Skoruba.Duende.IdentityServer.Admin"
$templateSrc = "template-build/content/src"
$templateRoot = "template-build/content"
$templateTests = "template-build/content/tests"
$templateAdminProject = "template-build/content/src/Skoruba.Duende.IdentityServer.Admin"

Get-Location

function CleanBinObjFolders { 

    # Clean up after migrations
    dotnet clean $templateAdminProject

    # Clean up bin, obj
    Get-ChildItem .\ -include bin, obj -Recurse | ForEach-Object ($_) { Remove-Item $_.fullname -Force -Recurse }    
}

# Clone the latest version from master branch
#git clone $gitProject $gitProjectFolder -b $gitBranchName

# Copy the local src and tests folders to the project folder instead of cloning from git
Copy-Item ../src $gitProjectFolder/src -Recurse -Force
Copy-Item ../tests $gitProjectFolder/tests -Recurse -Force

# Copy Docker files and shared resources if they exist
$dockerFiles = @(
    "docker-compose.dcproj",
    ".dockerignore",
    "docker-compose.override.yml",
    "docker-compose.yml",
    "Directory.Build.props"
)

foreach ($file in $dockerFiles) {
    $sourcePath = Join-Path ".." $file
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $gitProjectFolder -Force
    }
}

# Copy shared folder if it exists
$sharedSource = Join-Path ".." "shared"
if (Test-Path $sharedSource) {
    Copy-Item $sharedSource $gitProjectFolder -Recurse -Force
}


# Clean up src, tests folders
if ((Test-Path -Path $templateSrc)) { Remove-Item ./$templateSrc -recurse -force }
if ((Test-Path -Path $templateTests)) { Remove-Item ./$templateTests -recurse -force }

# Create src, tests folders
if (!(Test-Path -Path $templateSrc)) { mkdir $templateSrc }
if (!(Test-Path -Path $templateTests)) { mkdir $templateTests }

# Copy the latest src and tests to content
Copy-Item ./$gitProjectFolder/src/* $templateSrc -recurse -force
Copy-Item ./$gitProjectFolder/tests/* $templateTests -recurse -force

# Copy Docker files
Copy-Item ./$gitProjectFolder/docker-compose.dcproj $templateRoot -recurse -force
Copy-Item ./$gitProjectFolder/.dockerignore $templateRoot -recurse -force
Copy-Item ./$gitProjectFolder/docker-compose.override.yml $templateRoot -recurse -force
Copy-Item ./$gitProjectFolder/docker-compose.yml $templateRoot -recurse -force
Copy-Item ./$gitProjectFolder/shared $templateRoot -recurse -force

Copy-Item ./$gitProjectFolder/Directory.Build.props $templateRoot -recurse -force

# Clean up created folders
Remove-Item ./$gitProjectFolder -recurse -force

# Clean solution and folders bin, obj
CleanBinObjFolders

# Remove references

# API
dotnet remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.Api/Skoruba.Duende.IdentityServer.Admin.Api.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.UI.Api\Skoruba.Duende.IdentityServer.Admin.UI.Api.csproj

# Admin
dotnet remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.UI\Skoruba.Duende.IdentityServer.Admin.UI.csproj
dotnet remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj reference ..\Skoruba.Duende.IdentityServer.Shared.Configuration\Skoruba.Duende.IdentityServer.Shared.Configuration.csproj

# STS
dotnet remove ./$templateSrc/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj reference ..\Skoruba.Duende.IdentityServer.Shared.Configuration\Skoruba.Duende.IdentityServer.Shared.Configuration.csproj
dotnet remove ./$templateSrc/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.csproj

# EF Shared
dotnet remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.csproj

# Shared
dotnet remove ./$templateSrc/Skoruba.Duende.IdentityServer.Shared/Skoruba.Duende.IdentityServer.Shared.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.csproj

# Add nuget packages
# Admin
dotnet add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj package Skoruba.Duende.IdentityServer.Admin.UI -v $packagesVersions
dotnet add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj package Skoruba.Duende.IdentityServer.Admin.UI.Spa -v $packagesVersions
dotnet add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj package Skoruba.Duende.IdentityServer.Shared.Configuration -v $packagesVersions

# STS
dotnet add ./$templateSrc/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj package Skoruba.Duende.IdentityServer.Shared.Configuration -v $packagesVersions
dotnet add ./$templateSrc/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj package Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration -v $packagesVersions

# API
dotnet add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.Api/Skoruba.Duende.IdentityServer.Admin.Api.csproj package Skoruba.Duende.IdentityServer.Admin.UI.Api -v $packagesVersions

# EF Shared
dotnet add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.csproj package Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration -v $packagesVersions

# Shared
dotnet add ./$templateSrc/Skoruba.Duende.IdentityServer.Shared/Skoruba.Duende.IdentityServer.Shared.csproj package Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity -v $packagesVersions

# Clean solution and folders bin, obj
CleanBinObjFolders

# Clean up projects which will be installed via nuget packages
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.BusinessLogic -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.EntityFramework -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Shared.Configuration -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.UI -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.UI.Spa -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.UI.Client -Force -recurse
Remove-Item ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.UI.Api -Force -recurse
Remove-Item ./$templateTests -Force -recurse

$csprojPath = "$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj"

# Remove <SpaRoot>, <SpaProxyLaunchCommand>, <SpaProxyServerUrl> from .csproj
if (Test-Path $csprojPath) {
    $csprojContent = Get-Content $csprojPath
    $filteredCsproj = $csprojContent | Where-Object {
        $_ -notmatch '<SpaRoot>.*</SpaRoot>' -and
        $_ -notmatch '<SpaProxyLaunchCommand>.*</SpaProxyLaunchCommand>' -and
        $_ -notmatch '<SpaProxyServerUrl>.*</SpaProxyServerUrl>'
    }
    $filteredCsproj | Set-Content $csprojPath -Encoding UTF8
}

# Remove <ItemGroup> with ProjectReference to UI.Client.esproj from .csproj
if (Test-Path $csprojPath) {
    $csprojContent = Get-Content $csprojPath
    $result = @()
    $inGroup = $false
    $buffer = @()
    foreach ($line in $csprojContent) {
        if ($line -match '<ItemGroup>') {
            $inGroup = $true
            $buffer = @($line)
            continue
        }
        if ($inGroup) {
            $buffer += $line
            if ($line -match '</ItemGroup>') {
                $blockText = $buffer -join "`n"
                if ($blockText -notmatch 'ProjectReference\s+Include\s*=\s*".*Skoruba\.Duende\.IdentityServer\.Admin\.UI\.Client[\\/]+Skoruba\.Duende\.IdentityServer\.Admin\.UI\.Client\.esproj"') {
                    $result += $buffer
                }
                $buffer = @()
                $inGroup = $false
            }
            continue
        }
        $result += $line
    }
    $result | Set-Content $csprojPath -Encoding UTF8
}

# Remove ASPNETCORE_HOSTINGSTARTUPASSEMBLIES from launchSettings.json environmentVariables
$launchSettingsPath = "$templateSrc/Skoruba.Duende.IdentityServer.Admin/Properties/launchSettings.json"
if (Test-Path $launchSettingsPath) {
    $json = Get-Content $launchSettingsPath -Raw | ConvertFrom-Json
    foreach ($profileName in $json.profiles.PSObject.Properties.Name) {
        $env = $json.profiles.$profileName.environmentVariables
        if ($env) {
            # Remove the specific environment variable if present
            $env.PSObject.Properties.Remove("ASPNETCORE_HOSTINGSTARTUPASSEMBLIES")
        }
    }
    $json | ConvertTo-Json -Depth 20 | Set-Content $launchSettingsPath -Encoding UTF8
}

######################################

# Step 2
$templateNuspecPath = "template-build/Skoruba.Duende.IdentityServer.Admin.Templates.nuspec"
nuget pack ./$templateNuspecPath -NoDefaultExcludes

######################################
# Step 3
$templateLocalName = "Skoruba.Duende.IdentityServer.Admin.Templates.$packagesVersions.nupkg"

dotnet new --uninstall Skoruba.Duende.IdentityServer.Admin.Templates
dotnet new -i ./$templateLocalName

######################################
# Step 4
# Create template for fixing project name
dotnet new skoruba.duende.isadmin --name SkorubaDuende.IdentityServerAdmin --title "Skoruba Duende IdentityServer Admin" --adminrole SkorubaIdentityAdminAdministrator --adminclientid skoruba_identity_admin --adminclientsecret skoruba_admin_client_secret

######################################
# Step 5
# Replace files

CleanBinObjFolders

$templateFiles = Get-ChildItem ./SkorubaDuende.IdentityServerAdmin/src -include *.cs, *.csproj, *.cshtml -Recurse
foreach ($file in $templateFiles) {
    Write-Host $file.PSPath

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "SkorubaDuende.IdentityServerAdmin.Shared.Configuration", "Skoruba.Duende.IdentityServer.Shared.Configuration" } |
    Out-File $file.PSPath -Encoding UTF8 -NoNewline

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "SkorubaDuende.IdentityServerAdmin.Admin.UI", "Skoruba.Duende.IdentityServer.Admin.UI" } |
    Out-File $file.PSPath -Encoding UTF8 -NoNewline

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "SkorubaDuende.IdentityServerAdmin.Admin.UI.Api", "Skoruba.Duende.IdentityServer.Admin.UI.Api" } |
    Out-File $file.PSPath -Encoding UTF8 -NoNewline

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "SkorubaDuende.IdentityServerAdmin.Admin.BusinessLogic", "Skoruba.Duende.IdentityServer.Admin.BusinessLogic" } |
    Out-File $file.PSPath -Encoding UTF8 -NoNewline

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework", "Skoruba.Duende.IdentityServer.Admin.EntityFramework" } |
    Out-File $file.PSPath -Encoding UTF8 -NoNewline

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared", "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared" } |
    Out-File $file.PSPath -Encoding UTF8 -NoNewline

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "Skoruba.Duende.IdentityServer.Admin.EntityFramework.MySql", "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql" } |
    Out-File $file.PSPath -Encoding UTF8 -NoNewline

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL", "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL" } |
    Out-File $file.PSPath -Encoding UTF8 -NoNewline

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer", "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer" } |
    Out-File $file.PSPath -Encoding UTF8 -NoNewline
}


CleanBinObjFolders
