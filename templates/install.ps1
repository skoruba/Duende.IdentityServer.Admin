param([string] $packagesVersions)

./0-build-template.ps1 -packagesVersions $packagesVersions

./1-add-docker-support.ps1

./2-publish-template.ps1 -packagesVersions $packagesVersions
