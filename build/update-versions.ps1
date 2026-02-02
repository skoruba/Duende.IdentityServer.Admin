param([Parameter(Mandatory = $true)][string] $new)

$root = Resolve-Path (Join-Path $PSScriptRoot "..")

$targets = @(
    @{
        Path = Join-Path $root "Directory.Build.props"
        Pattern = "<Version>[^<]+</Version>"
        Replacement = "<Version>$new</Version>"
    },
    @{
        Path = Join-Path $root "templates/template-build/Skoruba.Duende.IdentityServer.Admin.Templates.nuspec"
        Pattern = "<version>[^<]+</version>"
        Replacement = "<version>$new</version>"
    },
    @{
        Path = Join-Path $root "templates/template-publish/Skoruba.Duende.IdentityServer.Admin.Templates.nuspec"
        Pattern = "<version>[^<]+</version>"
        Replacement = "<version>$new</version>"
    },
    @{
        Path = Join-Path $root "src/Skoruba.Duende.IdentityServer.Admin.UI.Client/package.json"
        Pattern = '(?m)^(\s*)"version"\s*:\s*"[^"]+"'
        Replacement = "$1`"version`": `"$new`""
    }
)

foreach ($target in $targets) {
    if (-not (Test-Path $target.Path)) {
        throw "File not found: $($target.Path)"
    }

    Write-Host $target.Path

    $content = Get-Content $target.Path -Raw -Encoding UTF8
    $updated = $content -replace $target.Pattern, $target.Replacement
    Set-Content $target.Path -Encoding UTF8 -NoNewline -Value $updated
}
