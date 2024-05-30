#!/bin/bash

# Ensure a version is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

version=$1

# Ensure buildx is set up
docker buildx create --use

# Change directory to the project root
cd ..

# Build docker images with platform specified and load them into the local Docker image store
docker buildx build --platform linux/amd64 -t skoruba-duende-identityserver-admin:latest --load -f src/Skoruba.Duende.IdentityServer.Admin/Dockerfile .
docker buildx build --platform linux/amd64 -t skoruba-duende-identityserver-admin-api:latest --load -f src/Skoruba.Duende.IdentityServer.Admin.Api/Dockerfile .
docker buildx build --platform linux/amd64 -t skoruba-duende-identityserver-sts-identity:latest --load -f src/Skoruba.Duende.IdentityServer.STS.Identity/Dockerfile .

# Rename images with the specified tag
docker tag skoruba-duende-identityserver-admin:latest skoruba/duende-identityserver-admin:$version
docker tag skoruba-duende-identityserver-admin-api:latest skoruba/duende-identityserver-admin-api:$version
docker tag skoruba-duende-identityserver-sts-identity:latest skoruba/duende-identityserver-sts-identity:$version

# Push to Docker Hub
docker push skoruba/duende-identityserver-admin:$version
docker push skoruba/duende-identityserver-admin-api:$version
docker push skoruba/duende-identityserver-sts-identity:$version
