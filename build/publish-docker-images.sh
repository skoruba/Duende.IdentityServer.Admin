#!/bin/bash

# Ensure a version is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version> <platform>"
  exit 1
fi

version=$1
platform=${2:-linux/amd64}  # Default to linux/amd64 if not provided

# Ensure buildx is set up
docker buildx create --use

# Change directory to the project root
cd ..

# Build and load docker images with platform specified and verify architecture
docker buildx build --platform $platform -t skoruba-duende-identityserver-admin:latest --load --no-cache -f src/Skoruba.Duende.IdentityServer.Admin/Dockerfile .
docker inspect --format '{{.Os}}/{{.Architecture}}' skoruba-duende-identityserver-admin:latest

docker buildx build --platform $platform -t skoruba-duende-identityserver-admin-api:latest --load --no-cache -f src/Skoruba.Duende.IdentityServer.Admin.Api/Dockerfile .
docker inspect --format '{{.Os}}/{{.Architecture}}' skoruba-duende-identityserver-admin-api:latest

docker buildx build --platform $platform -t skoruba-duende-identityserver-sts-identity:latest --load --no-cache -f src/Skoruba.Duende.IdentityServer.STS.Identity/Dockerfile .
docker inspect --format '{{.Os}}/{{.Architecture}}' skoruba-duende-identityserver-sts-identity:latest

# Tag images with the specified version
docker tag skoruba-duende-identityserver-admin:latest skoruba/duende-identityserver-admin:$version
docker tag skoruba-duende-identityserver-admin-api:latest skoruba/duende-identityserver-admin-api:$version
docker tag skoruba-duende-identityserver-sts-identity:latest skoruba/duende-identityserver-sts-identity:$version

# Push images to Docker Hub
docker push skoruba/duende-identityserver-admin:$version
docker push skoruba/duende-identityserver-admin-api:$version
docker push skoruba/duende-identityserver-sts-identity:$version
