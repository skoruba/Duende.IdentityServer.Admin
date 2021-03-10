FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.1-buster AS build
WORKDIR /src
COPY ["src/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj", "src/Skoruba.Duende.IdentityServer.STS.Identity/"]
COPY ["src/Skoruba.Duende.IdentityServer.Shared.Configuration/Skoruba.Duende.IdentityServer.Shared.Configuration.csproj", "src/Skoruba.Duende.IdentityServer.Shared.Configuration/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework/Skoruba.Duende.IdentityServer.Admin.EntityFramework.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration/"]
COPY ["src/Skoruba.Duende.IdentityServer.Shared/Skoruba.Duende.IdentityServer.Shared.csproj", "src/Skoruba.Duende.IdentityServer.Shared/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.csproj", "src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared.csproj", "src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared/"]
RUN dotnet restore "src/Skoruba.Duende.IdentityServer.STS.Identity/Skoruba.Duende.IdentityServer.STS.Identity.csproj"
COPY . .
WORKDIR "/src/src/Skoruba.Duende.IdentityServer.STS.Identity"
RUN dotnet build "Skoruba.Duende.IdentityServer.STS.Identity.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Skoruba.Duende.IdentityServer.STS.Identity.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "Skoruba.Duende.IdentityServer.STS.Identity.dll"]