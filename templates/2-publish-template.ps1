param([string] $packagesVersions)

$templateNuspecPath = "template-publish/Skoruba.Duende.IdentityServer.Admin.Templates.nuspec"
nuget pack $templateNuspecPath

dotnet new --debug:reinit

$templateLocalName = "Skoruba.Duende.IdentityServer.Admin.Templates.$packagesVersions.nupkg"
dotnet.exe new -i $templateLocalName

dotnet.exe new skoruba.duende.isadmin --name MyProject --title MyProject --adminemail 'admin@skoruba.com' --adminpassword 'Pa$$word123' --adminrole MyRole --adminclientid MyClientId --adminclientsecret MyClientSecret --dockersupport true