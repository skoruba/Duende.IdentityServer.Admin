FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM node:22-bookworm-slim AS node

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG TARGETARCH
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    NUGET_XMLDOC_MODE=skip
WORKDIR /src

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && npm install -g npm@latest \
    && node --version && npm --version

COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin/SkorubaDuende.IdentityServerAdmin.Admin.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Identity/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Identity.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Identity/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Extensions/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Extensions.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Extensions/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Configuration/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Configuration.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Configuration/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.UI/SkorubaDuende.IdentityServerAdmin.Admin.UI.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.UI/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Shared.Configuration/SkorubaDuende.IdentityServerAdmin.Shared.Configuration.csproj", "src/SkorubaDuende.IdentityServerAdmin.Shared.Configuration/"]
COPY ["src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.csproj", "src/SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared/"]

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
