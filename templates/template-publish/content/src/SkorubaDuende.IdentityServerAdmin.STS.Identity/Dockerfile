FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/SkorubaDuende.IdentityServerAdmin.STS.Identity/SkorubaDuende.IdentityServerAdmin.STS.Identity.csproj", "src/SkorubaDuende.IdentityServerAdmin.STS.Identity/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Shared/SkorubaDuende.IdentityServerAdmin.Shared.csproj", "src/SkorubaDuende.IdentityServerAdmin.Shared/"]
RUN dotnet restore "src/SkorubaDuende.IdentityServerAdmin.STS.Identity/SkorubaDuende.IdentityServerAdmin.STS.Identity.csproj"
COPY . .
WORKDIR "/src/src/SkorubaDuende.IdentityServerAdmin.STS.Identity"
RUN dotnet build "SkorubaDuende.IdentityServerAdmin.STS.Identity.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SkorubaDuende.IdentityServerAdmin.STS.Identity.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "SkorubaDuende.IdentityServerAdmin.STS.Identity.dll"]