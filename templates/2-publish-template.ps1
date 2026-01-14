param([string] $packagesVersions)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$sourceReadme = Join-Path $scriptRoot '..\README.md'
$sourceIcon = Join-Path $scriptRoot '..\docs\Images\nuget-icon.png'
$targetDir = Join-Path $scriptRoot 'template-publish'

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

if (Test-Path $sourceReadme) {
    Copy-Item -Path $sourceReadme -Destination (Join-Path $targetDir 'README.md') -Force
}
else {
    Write-Warning "Source README not found: $sourceReadme"
}

if (Test-Path $sourceIcon) {
    Copy-Item -Path $sourceIcon -Destination (Join-Path $targetDir 'nuget-icon.png') -Force
}
else {
    Write-Warning "Source icon not found: $sourceIcon"
}

$templateNuspecPath = "template-publish/Skoruba.Duende.IdentityServer.Admin.Templates.nuspec"
nuget pack $templateNuspecPath -NoDefaultExcludes

dotnet new --uninstall Skoruba.Duende.IdentityServer.Admin.Templates

$templateLocalName = "Skoruba.Duende.IdentityServer.Admin.Templates.$packagesVersions.nupkg"
dotnet new -i $templateLocalName

dotnet new skoruba.duende.isadmin --name MyProject --title MyProject --adminemail 'admin@skoruba.com' --adminpassword 'P@ssword123' --adminrole SkorubaIdentityAdminAdministrator --adminclientid skoruba_identity_admin_v3 --adminclientsecret skoruba_admin_client_secret --dockersupport true --requirepushedauthorization true