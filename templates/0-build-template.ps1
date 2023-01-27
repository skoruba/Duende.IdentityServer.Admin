param([string] $packagesVersions, [string]$gitBranchName = 'dev')

# This script contains following steps:
# - Download latest version of Skoruba.Duende.IdentityServer.Admin from git repository
# - Use folders src and tests for project template
# - Create db migrations for seed data

$gitProject = "https://github.com/skoruba/Duende.IdentityServer.Admin"
$gitProjectFolder = "Skoruba.Duende.IdentityServer.Admin"
$templateSrc = "template-build/content/src"
$templateRoot = "template-build/content"
$templateTests = "template-build/content/tests"
$templateAdminProject = "template-build/content/src/Skoruba.Duende.IdentityServer.Admin"

Get-Location

function CleanBinObjFolders { 

    # Clean up after migrations
    dotnet.exe clean $templateAdminProject

    # Clean up bin, obj
    Get-ChildItem .\ -include bin, obj -Recurse | ForEach-Object ($_) { Remove-Item $_.fullname -Force -Recurse }    
}

# Clone the latest version from master branch
git.exe clone $gitProject $gitProjectFolder -b $gitBranchName

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
Copy-Item ./$gitProjectFolder/docker-compose.vs.debug.yml $templateRoot -recurse -force
Copy-Item ./$gitProjectFolder/docker-compose.vs.release.yml $templateRoot -recurse -force
Copy-Item ./$gitProjectFolder/docker-compose.yml $templateRoot -recurse -force
Copy-Item ./$gitProjectFolder/shared $templateRoot -recurse -force

Copy-Item ./$gitProjectFolder/Directory.Build.props $templateRoot -recurse -force

# Clean up created folders
Remove-Item ./$gitProjectFolder -recurse -force

# Clean solution and folders bin, obj
CleanBinObjFolders

# Remove references

# API
dotnet.exe remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.Api/Skoruba.Duende.IdentityServer.Admin.Api.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.csproj
dotnet.exe remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.Api/Skoruba.Duende.IdentityServer.Admin.Api.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.BusinessLogic\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.csproj
dotnet.exe remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.Api/Skoruba.Duende.IdentityServer.Admin.Api.csproj reference ..\Skoruba.Duende.IdentityServer.Shared.Configuration\Skoruba.Duende.IdentityServer.Shared.Configuration.csproj

# Admin
dotnet.exe remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.BusinessLogic\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.csproj
dotnet.exe remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.UI\Skoruba.Duende.IdentityServer.Admin.UI.csproj

# STS
dotnet.exe remove ./$templateSrc/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj reference ..\Skoruba.Duende.IdentityServer.Shared.Configuration\Skoruba.Duende.IdentityServer.Shared.Configuration.csproj
dotnet.exe remove ./$templateSrc/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.csproj

# EF Shared
dotnet.exe remove ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.csproj

# Shared
dotnet.exe remove ./$templateSrc/Skoruba.Duende.IdentityServer.Shared/Skoruba.Duende.IdentityServer.Shared.csproj reference ..\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.csproj

# Add nuget packages
# Admin
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj package Skoruba.Duende.IdentityServer.Admin.BusinessLogic -v $packagesVersions
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj package Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity -v $packagesVersions
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj package Skoruba.Duende.IdentityServer.Admin.UI -v $packagesVersions

# STS
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj package Skoruba.Duende.IdentityServer.Shared.Configuration -v $packagesVersions
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj package Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration -v $packagesVersions

# API
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.Api/Skoruba.Duende.IdentityServer.Admin.Api.csproj package Skoruba.Duende.IdentityServer.Admin.BusinessLogic -v $packagesVersions
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.Api/Skoruba.Duende.IdentityServer.Admin.Api.csproj package Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity -v $packagesVersions
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.Api/Skoruba.Duende.IdentityServer.Admin.Api.csproj package Skoruba.Duende.IdentityServer.Shared.Configuration -v $packagesVersions

# EF Shared
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.csproj package Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration -v $packagesVersions

# Shared
dotnet.exe add ./$templateSrc/Skoruba.Duende.IdentityServer.Shared/Skoruba.Duende.IdentityServer.Shared.csproj package Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity -v $packagesVersions

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
Remove-Item ./$templateTests -Force -recurse

######################################

Get-Location

Set-Location "/templates"

# Step 2
$templateNuspecPath = "template-build/Skoruba.Duende.IdentityServer.Admin.Templates.nuspec"
nuget pack ./$templateNuspecPath -NoDefaultExcludes

######################################
# Step 3
$templateLocalName = "Skoruba.Duende.IdentityServer.Admin.Templates.$packagesVersions.nupkg"

dotnet.exe new --uninstall Skoruba.Duende.IdentityServer.Admin.Templates
dotnet.exe new -i ./$templateLocalName

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
    Set-Content $file.PSPath -Encoding UTF8

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "SkorubaDuende.IdentityServerAdmin.Admin.UI", "Skoruba.Duende.IdentityServer.Admin.UI" } |
    Set-Content $file.PSPath -Encoding UTF8

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "SkorubaDuende.IdentityServerAdmin.Admin.BusinessLogic", "Skoruba.Duende.IdentityServer.Admin.BusinessLogic" } |
    Set-Content $file.PSPath -Encoding UTF8

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework", "Skoruba.Duende.IdentityServer.Admin.EntityFramework" } |
    Set-Content $file.PSPath -Encoding UTF8

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared", "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared" } |
    Set-Content $file.PSPath -Encoding UTF8

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "Skoruba.Duende.IdentityServer.Admin.EntityFramework.MySql", "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql" } |
    Set-Content $file.PSPath -Encoding UTF8

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL", "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL" } |
    Set-Content $file.PSPath -Encoding UTF8

    (Get-Content $file.PSPath -raw -Encoding UTF8) |
    Foreach-Object { $_ -replace "Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer", "SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer" } |
    Set-Content $file.PSPath -Encoding UTF8
}

CleanBinObjFolders
