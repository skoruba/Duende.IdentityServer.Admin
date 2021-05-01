$templateSrc = "template-publish/content/src"
$temporaryProjectFolder = "SkorubaDuende.IdentityServerAdmin"
$templateDockerFolder = "template-docker"

# Remove original src folder for publish folder
if ((Test-Path -Path $templateSrc)) { Remove-Item ./$templateSrc -recurse -force }

# Copy new src folder
Copy-Item ./$temporaryProjectFolder/src ./$templateSrc -recurse -force

# Copy docker files for Admin, Api and STS
Copy-Item ./$templateDockerFolder/SkorubaDuende.IdentityServerAdmin.Admin/* $templateSrc/SkorubaDuende.IdentityServerAdmin.Admin -recurse -force
Copy-Item ./$templateDockerFolder/SkorubaDuende.IdentityServerAdmin.Admin.Api/* $templateSrc/SkorubaDuende.IdentityServerAdmin.Admin.Api -recurse -force
Copy-Item ./$templateDockerFolder/SkorubaDuende.IdentityServerAdmin.STS.Identity/* $templateSrc/SkorubaDuende.IdentityServerAdmin.STS.Identity -recurse -force