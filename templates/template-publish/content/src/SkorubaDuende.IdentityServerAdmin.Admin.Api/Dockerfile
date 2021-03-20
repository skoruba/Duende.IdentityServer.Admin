FROM mcr.microsoft.com/dotnet/aspnet:5.0-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:5.0-buster-slim AS build
WORKDIR /src
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.Api/SkorubaDuende.IdentityServerAdmin.Admin.Api.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.Api/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Shared/SkorubaDuende.IdentityServerAdmin.Shared.csproj", "src/SkorubaDuende.IdentityServerAdmin.Shared/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql/"]
RUN dotnet restore "src/SkorubaDuende.IdentityServerAdmin.Admin.Api/SkorubaDuende.IdentityServerAdmin.Admin.Api.csproj"
COPY . .
WORKDIR "/src/src/SkorubaDuende.IdentityServerAdmin.Admin.Api"
RUN dotnet build "SkorubaDuende.IdentityServerAdmin.Admin.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SkorubaDuende.IdentityServerAdmin.Admin.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "SkorubaDuende.IdentityServerAdmin.Admin.Api.dll"]