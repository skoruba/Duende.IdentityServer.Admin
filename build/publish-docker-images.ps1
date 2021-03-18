param([string] $version)

Set-Location "../"

# build docker images according to docker-compose
docker-compose build

# rename images with following tag
docker tag skoruba-duende-identityserver-admin skoruba/duende-identityserver-admin:$version
docker tag skoruba-duende-identityserver-sts-identity skoruba/duende-identityserver-sts-identity:$version
docker tag skoruba-duende-identityserver-admin-api skoruba/duende-identityserver-admin-api:$version

# push to docker hub
docker push skoruba/duende-identityserver-admin:$version
docker push skoruba/duende-identityserver-admin-api:$version
docker push skoruba/duende-identityserver-sts-identity:$version