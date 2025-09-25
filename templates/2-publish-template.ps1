param([string] $packagesVersions)

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$sourceReadme = Join-Path $scriptRoot '..\README.md'
$sourceIcon   = Join-Path $scriptRoot '..\docs\Images\nuget-icon.png'
$targetDir    = Join-Path $scriptRoot 'template-publish'

if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

if (Test-Path $sourceReadme) {
    Copy-Item -Path $sourceReadme -Destination (Join-Path $targetDir 'README.md') -Force
} else {
    Write-Warning "Source README not found: $sourceReadme"
}

if (Test-Path $sourceIcon) {
    Copy-Item -Path $sourceIcon -Destination (Join-Path $targetDir 'nuget-icon.png') -Force
} else {
    Write-Warning "Source icon not found: $sourceIcon"
}

$templateNuspecPath = "template-publish/Skoruba.Duende.IdentityServer.Admin.Templates.nuspec"
nuget pack $templateNuspecPath -NoDefaultExcludes

dotnet new --uninstall Skoruba.Duende.IdentityServer.Admin.Templates

$templateLocalName = "Skoruba.Duende.IdentityServer.Admin.Templates.$packagesVersions.nupkg"
dotnet new -i $templateLocalName

dotnet new skoruba.duende.isadmin --name MyProject --title MyProject --adminemail 'admin@skoruba.com' --adminpassword 'Pa$$word123' --adminrole MyRole --adminclientid MyClientId --adminclientsecret MyClientSecret --dockersupport true --requirepushedauthorization false