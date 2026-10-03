#!/bin/bash

# Ensure a version is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version> <platforms>"
  exit 1
fi

version=$1
platforms=${2:-linux/amd64,linux/arm64}  # Default to linux/amd64 and linux/arm64 if not provided

# A pre-release version (e.g. 3.2.0-preview1) is pushed under its own tag only, so that :latest keeps the last release
if [[ "$version" == *-* ]]; then
  latest_tag=""
else
  latest_tag="latest"
fi

# Prints the -t arguments for an image: the version tag and, for a release, the latest tag
tags() {
  echo "-t skoruba/$1:$version ${latest_tag:+-t skoruba/$1:$latest_tag}"
}

# Ensure buildx is set up
docker buildx create --use

# Change directory to the project root
cd ..

# Build and push docker images with platforms specified
docker buildx build --platform $platforms $(tags duende-identityserver-admin-with-api) --push --no-cache -f deploy/admin-with-api/Dockerfile .
docker buildx build --platform $platforms $(tags duende-identityserver-admin) --push --no-cache -f src/Skoruba.Duende.IdentityServer.Admin/Dockerfile .
docker buildx build --platform $platforms $(tags duende-identityserver-admin-api) --push --no-cache -f src/Skoruba.Duende.IdentityServer.Admin.Api/Dockerfile .
docker buildx build --platform $platforms $(tags duende-identityserver-sts-identity) --push --no-cache -f src/Skoruba.Duende.IdentityServer.STS.Identity/Dockerfile .
