param([string] $packagesVersions, [string]$gitBranchName = 'dev')

$PSScriptRoot\0-build-template.ps1 -packagesVersions $packagesVersions -gitBranchName $gitBranchName

$PSScriptRoot\1-add-docker-support.ps1

$PSScriptRoot\2-publish-template.ps1 -packagesVersions $packagesVersions