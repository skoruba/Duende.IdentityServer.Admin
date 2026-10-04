param(
    [Parameter(Mandatory = $true)][string] $version,
    # Keep checking until every package is available instead of failing right away
    [switch] $wait,
    [int] $intervalSeconds = 30
)

# The template (templates/0-build-template.ps1) restores these packages from nuget.org,
# so all of them have to be downloadable before the template can be built.
$packages = @(
    "Skoruba.Duende.IdentityServer.Admin.BusinessLogic",
    "Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity",
    "Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared",
    "Skoruba.Duende.IdentityServer.Admin.EntityFramework",
    "Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin",
    "Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage",
    "Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions",
    "Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity",
    "Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared",
    "Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration",
    "Skoruba.Duende.IdentityServer.Shared.Configuration",
    "Skoruba.Duende.IdentityServer.Admin.UI",
    "Skoruba.Duende.IdentityServer.Admin.UI.Spa",
    "Skoruba.Duende.IdentityServer.Admin.UI.Api"
)

$flatContainer = "https://api.nuget.org/v3-flatcontainer"

# A package is ready when the flat container lists the version and the .nupkg itself can be downloaded,
# because nuget.org shows the version in the index a while before the file is served.
function Test-PackageReady([string] $id) {
    $lowerId = $id.ToLowerInvariant()
    $lowerVersion = $version.ToLowerInvariant()

    try {
        $index = Invoke-RestMethod -Uri "$flatContainer/$lowerId/index.json" -ErrorAction Stop
    }
    catch {
        return $false
    }

    if ($index.versions -notcontains $lowerVersion) {
        return $false
    }

    try {
        Invoke-WebRequest -Method Head -Uri "$flatContainer/$lowerId/$lowerVersion/$lowerId.$lowerVersion.nupkg" -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

while ($true) {
    $missing = @()

    foreach ($package in $packages) {
        if (Test-PackageReady $package) {
            Write-Host "OK       $package $version" -ForegroundColor Green
        }
        else {
            Write-Host "MISSING  $package $version" -ForegroundColor Yellow
            $missing += $package
        }
    }

    if ($missing.Count -eq 0) {
        Write-Host "`nAll $($packages.Count) packages $version are ready, the template can be built." -ForegroundColor Green
        exit 0
    }

    if (-not $wait) {
        Write-Host "`n$($missing.Count) of $($packages.Count) packages are not available yet." -ForegroundColor Red
        exit 1
    }

    Write-Host "`n$($missing.Count) of $($packages.Count) packages are not available yet, checking again in $intervalSeconds s...`n"
    Start-Sleep -Seconds $intervalSeconds
}
