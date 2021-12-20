FROM mcr.microsoft.com/dotnet/aspnet:6.0-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0-buster-slim AS build
WORKDIR /src
COPY ["src/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj", "src/Skoruba.Duende.IdentityServer.Admin/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL/Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.PostgreSQL/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework/Skoruba.Duende.IdentityServer.Admin.EntityFramework.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.csproj", "src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared.csproj", "src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.UI/Skoruba.Duende.IdentityServer.Admin.UI.csproj", "src/Skoruba.Duende.IdentityServer.Admin.UI/"]
COPY ["src/Skoruba.Duende.IdentityServer.Shared.Configuration/Skoruba.Duende.IdentityServer.Shared.Configuration.csproj", "src/Skoruba.Duende.IdentityServer.Shared.Configuration/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic/Skoruba.Duende.IdentityServer.Admin.BusinessLogic.csproj", "src/Skoruba.Duende.IdentityServer.Admin.BusinessLogic/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.MySql/Skoruba.Duende.IdentityServer.Admin.EntityFramework.MySql.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.MySql/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer/Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.SqlServer/"]
COPY ["src/Skoruba.Duende.IdentityServer.Shared/Skoruba.Duende.IdentityServer.Shared.csproj", "src/Skoruba.Duende.IdentityServer.Shared/"]
RUN dotnet restore "src/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj"
COPY . .
WORKDIR "/src/src/Skoruba.Duende.IdentityServer.Admin"
RUN dotnet build "Skoruba.Duende.IdentityServer.Admin.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Skoruba.Duende.IdentityServer.Admin.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "Skoruba.Duende.IdentityServer.Admin.dll"]