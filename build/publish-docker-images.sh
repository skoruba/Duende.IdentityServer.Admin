#!/bin/bash

# Ensure a version is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version> <platforms>"
  exit 1
fi

version=$1
platforms=${2:-linux/amd64,linux/arm64}  # Default to linux/amd64 and linux/arm64 if not provided

# Ensure buildx is set up
docker buildx create --use

# Change directory to the project root
cd ..

# Build and push docker images with platforms specified
docker buildx build --platform $platforms -t skoruba/duende-identityserver-admin:latest -t skoruba/duende-identityserver-admin:$version --push --no-cache -f src/Skoruba.Duende.IdentityServer.Admin/Dockerfile .
docker buildx build --platform $platforms -t skoruba/duende-identityserver-admin-api:latest -t skoruba/duende-identityserver-admin-api:$version --push --no-cache -f src/Skoruba.Duende.IdentityServer.Admin.Api/Dockerfile .
docker buildx build --platform $platforms -t skoruba/duende-identityserver-sts-identity:latest -t skoruba/duende-identityserver-sts-identity:$version --push --no-cache -f src/Skoruba.Duende.IdentityServer.STS.Identity/Dockerfile .
