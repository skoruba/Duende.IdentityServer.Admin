FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG TARGETARCH
WORKDIR /src

COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin/SkorubaDuende.IdentityServerAdmin.Admin.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.SqlServer/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Shared/SkorubaDuende.IdentityServerAdmin.Shared.csproj", "src/SkorubaDuende.IdentityServerAdmin.Shared/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.PostgreSQL/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.MySql/"]
RUN dotnet restore -a $TARGETARCH "src/SkorubaDuende.IdentityServerAdmin.Admin/SkorubaDuende.IdentityServerAdmin.Admin.csproj"
COPY . .
WORKDIR "/src/src/SkorubaDuende.IdentityServerAdmin.Admin"
RUN dotnet build -a $TARGETARCH "SkorubaDuende.IdentityServerAdmin.Admin.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -a $TARGETARCH "SkorubaDuende.IdentityServerAdmin.Admin.csproj" -c Release --no-restore -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "SkorubaDuende.IdentityServerAdmin.Admin.dll"]