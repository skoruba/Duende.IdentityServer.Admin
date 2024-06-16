FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
WORKDIR /src
COPY ["src/SkorubaDuende.IdentityServerAdmin.STS.Identity/SkorubaDuende.IdentityServerAdmin.STS.Identity.csproj", "src/SkorubaDuende.IdentityServerAdmin.STS.Identity/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Shared/SkorubaDuende.IdentityServerAdmin.Shared.csproj", "src/SkorubaDuende.IdentityServerAdmin.Shared/"]
RUN dotnet restore -a $TARGETARCH "src/SkorubaDuende.IdentityServerAdmin.STS.Identity/SkorubaDuende.IdentityServerAdmin.STS.Identity.csproj"
COPY . .
WORKDIR "/src/src/SkorubaDuende.IdentityServerAdmin.STS.Identity"
RUN dotnet build -a $TARGETARCH "SkorubaDuende.IdentityServerAdmin.STS.Identity.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -a $TARGETARCH "SkorubaDuende.IdentityServerAdmin.STS.Identity.csproj" -c Release --no-restore -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "SkorubaDuende.IdentityServerAdmin.STS.Identity.dll"]