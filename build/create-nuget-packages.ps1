$packagesOutput = ".\packages"

# Business Logic
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Admin.BusinessLogic\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.csproj -c Release -o $packagesOutput
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.csproj -c Release -o $packagesOutput
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared\Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared.csproj -c Release -o $packagesOutput
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Shared.Configuration\Skoruba.Duende.IdentityServer.Shared.Configuration.csproj -c Release -o $packagesOutput

# EF
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Admin.EntityFramework\Skoruba.Duende.IdentityServer.Admin.EntityFramework.csproj -c Release -o $packagesOutput
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.csproj -c Release -o $packagesOutput
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.csproj -c Release -o $packagesOutput
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.csproj -c Release -o $packagesOutput
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration\Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.csproj -c Release -o $packagesOutput

# UI
dotnet pack .\..\src\Skoruba.Duende.IdentityServer.Admin.UI\Skoruba.Duende.IdentityServer.Admin.UI.csproj -c Release -o $packagesOutput
