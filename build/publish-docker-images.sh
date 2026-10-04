#!/bin/bash

# --admin-with-api-only builds just the images a single-container deployment needs (admin-with-api and STS), e.g. for testing on DO
admin_with_api_only=false
args=()
for arg in "$@"; do
  case "$arg" in
    --admin-with-api-only) admin_with_api_only=true ;;
    *) args+=("$arg") ;;
  esac
done

# Ensure a version is provided
if [ -z "${args[0]}" ]; then
  echo "Usage: $0 <version> [platforms] [--admin-with-api-only]"
  exit 1
fi

version=${args[0]}
platforms=${args[1]:-linux/amd64,linux/arm64}  # Default to linux/amd64 and linux/arm64 if not provided

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
if [ "$admin_with_api_only" = false ]; then
  docker buildx build --platform $platforms $(tags duende-identityserver-admin) --push --no-cache -f src/Skoruba.Duende.IdentityServer.Admin/Dockerfile .
  docker buildx build --platform $platforms $(tags duende-identityserver-admin-api) --push --no-cache -f src/Skoruba.Duende.IdentityServer.Admin.Api/Dockerfile .
fi
docker buildx build --platform $platforms $(tags duende-identityserver-sts-identity) --push --no-cache -f src/Skoruba.Duende.IdentityServer.STS.Identity/Dockerfile .
