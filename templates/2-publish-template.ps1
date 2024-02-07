param([string] $packagesVersions)

$templateNuspecPath = "template-publish/Skoruba.Duende.IdentityServer.Admin.Templates.nuspec"
nuget pack $templateNuspecPath -NoDefaultExcludes

dotnet new --uninstall Skoruba.Duende.IdentityServer.Admin.Templates

$templateLocalName = "Skoruba.Duende.IdentityServer.Admin.Templates.$packagesVersions.nupkg"
dotnet new -i $templateLocalName

dotnet new skoruba.duende.isadmin --name MyProject --title MyProject --adminemail 'admin@skoruba.com' --adminpassword 'Pa$$word123' --adminrole MyRole --adminclientid MyClientId --adminclientsecret MyClientSecret --dockersupport true