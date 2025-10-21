FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM node:22-bookworm-slim AS node

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG TARGETARCH
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    NUGET_XMLDOC_MODE=skip
WORKDIR /src

COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && npm install -g npm@latest \
    && node --version && npm --version

COPY ["src/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj", "src/Skoruba.Duende.IdentityServer.Admin/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework/Skoruba.Duende.IdentityServer.Admin.EntityFramework.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.UI/Skoruba.Duende.IdentityServer.Admin.UI.csproj", "src/Skoruba.Duende.IdentityServer.Admin.UI/"]
COPY ["src/Skoruba.Duende.IdentityServer.Shared.Configuration/Skoruba.Duende.IdentityServer.Shared.Configuration.csproj", "src/Skoruba.Duende.IdentityServer.Shared.Configuration/"]
COPY ["src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.csproj", "src/Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared/"]

RUN dotnet restore -a $TARGETARCH "src/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj"

COPY . .
WORKDIR "/src/src/Skoruba.Duende.IdentityServer.Admin"
RUN dotnet build -a $TARGETARCH "Skoruba.Duende.IdentityServer.Admin.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -a $TARGETARCH "Skoruba.Duende.IdentityServer.Admin.csproj" -c Release --no-restore -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "Skoruba.Duende.IdentityServer.Admin.dll"]
