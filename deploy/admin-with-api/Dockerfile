# Admin UI and Admin API in one container.
#
# The Admin UI (BFF) listens on port 8080 and proxies /identity-server-admin-api/* to the Admin API,
# which listens on 127.0.0.1:5000 only and is never reachable from outside the container.
# Meant for hosting platforms that charge per container, such as DigitalOcean App Platform.
# The STS (Skoruba.Duende.IdentityServer.STS.Identity) still runs as a separate container.
#
# Build from the repository root:
#   docker build -f deploy/admin-with-api/Dockerfile -t skoruba/duende-identityserver-admin-with-api .

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS node

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG TARGETARCH
ENV DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    NUGET_XMLDOC_MODE=skip
WORKDIR /src

# Node is needed by the SPA build that runs as part of the Admin UI publish
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && node --version && npm --version

COPY . .

RUN dotnet publish -a $TARGETARCH "src/Skoruba.Duende.IdentityServer.Admin.Api/Skoruba.Duende.IdentityServer.Admin.Api.csproj" -c Release -o /app/publish/api
RUN dotnet publish -a $TARGETARCH "src/Skoruba.Duende.IdentityServer.Admin/Skoruba.Duende.IdentityServer.Admin.csproj" -c Release -o /app/publish/admin

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish/api ./api
COPY --from=build /app/publish/admin ./admin
COPY deploy/admin-with-api/entrypoint.sh ./entrypoint.sh
RUN sed -i 's/\r$//' ./entrypoint.sh && chmod +x ./entrypoint.sh

# The Admin UI proxies to the Admin API inside the container (see entrypoint.sh).
# Workstation GC: server GC would size a heap for every core of the host, in each of the two processes.
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true \
    AdminConfiguration__ApiConfiguration__ApiRemoteConfiguration__RemoteUrl=http://127.0.0.1:5000 \
    DOTNET_gcServer=0

ENTRYPOINT ["./entrypoint.sh"]
