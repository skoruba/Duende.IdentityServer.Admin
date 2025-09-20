FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG TARGETARCH
WORKDIR /src

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
