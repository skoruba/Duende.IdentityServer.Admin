param([string] $packagesVersions, [string]$gitBranchName = 'dev')

$currentPath = Get-Location
Set-Location $currentPath/templates

./0-build-template.ps1 -packagesVersions $packagesVersions -gitBranchName $gitBranchName

./1-add-docker-support.ps1

./2-publish-template.ps1 -packagesVersions $packagesVersions
