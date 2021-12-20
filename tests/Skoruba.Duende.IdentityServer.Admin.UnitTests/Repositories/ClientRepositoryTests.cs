// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Entities;
using Duende.IdentityServer.EntityFramework.Options;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Repositories
{
    public class ClientRepositoryTests
    {
        public ClientRepositoryTests()
        {
            var databaseName = Guid.NewGuid().ToString();

            _dbContextOptions = new DbContextOptionsBuilder<IdentityServerConfigurationDbContext>()
                .UseInMemoryDatabase(databaseName)
                .Options;

            _storeOptions = new ConfigurationStoreOptions();
            _operationalStore = new OperationalStoreOptions();
        }

        private readonly DbContextOptions<IdentityServerConfigurationDbContext> _dbContextOptions;
        private readonly ConfigurationStoreOptions _storeOptions;
        private readonly OperationalStoreOptions _operationalStore;

        private IClientRepository GetClientRepository(IdentityServerConfigurationDbContext context)
        {
            IClientRepository clientRepository = new ClientRepository<IdentityServerConfigurationDbContext>(context);

            return clientRepository;
        }

        private IApiResourceRepository GetApiResourceRepository(IdentityServerConfigurationDbContext context)
        {
            IApiResourceRepository apiResourceRepository = new ApiResourceRepository<IdentityServerConfigurationDbContext>(context);

            return apiResourceRepository;
        }

        private IApiScopeRepository GetApiScopeRepository(IdentityServerConfigurationDbContext context)
        {
            IApiScopeRepository apiScopeRepository = new ApiScopeRepository<IdentityServerConfigurationDbContext>(context);

            return apiScopeRepository;
        }

        private IIdentityResourceRepository GetIdentityResourceRepository(IdentityServerConfigurationDbContext context)
        {
            IIdentityResourceRepository identityResourceRepository = new IdentityResourceRepository<IdentityServerConfigurationDbContext>(context);

            return identityResourceRepository;
        }

        [Fact]
        public async Task AddClientAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await context.Clients.Where(x => x.Id == client.Id).SingleAsync();

                //Assert new client
                client.Should().BeEquivalentTo(clientEntity, options => options.Excluding(o => o.Id));
            }
        }

        [Fact]
        public async Task AddClientClaimAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);

                //Generate random new Client Claim
                var clientClaim = ClientMock.GenerateRandomClientClaim(0);

                //Add new client claim
                await clientRepository.AddClientClaimAsync(clientEntity.Id, clientClaim);

                //Get new client claim
                var newClientClaim =
                    await context.ClientClaims.Where(x => x.Id == clientClaim.Id).SingleOrDefaultAsync();

                clientClaim.Should().BeEquivalentTo(newClientClaim,
                    options => options.Excluding(o => o.Id).Excluding(x => x.Client));
            }
        }

        [Fact]
        public async Task AddClientPropertyAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);

                //Generate random new Client property
                var clientProperty = ClientMock.GenerateRandomClientProperty(0);

                //Add new client property
                await clientRepository.AddClientPropertyAsync(clientEntity.Id, clientProperty);

                //Get new client property
                var newClientProperty = await context.ClientProperties.Where(x => x.Id == clientProperty.Id)
                    .SingleOrDefaultAsync();

                clientProperty.Should().BeEquivalentTo(newClientProperty,
                    options => options.Excluding(o => o.Id).Excluding(x => x.Client));
            }
        }

        [Fact]
        public async Task AddClientSecretAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);

                //Generate random new Client Secret
                var clientSecret = ClientMock.GenerateRandomClientSecret(0);

                //Add new client secret
                await clientRepository.AddClientSecretAsync(clientEntity.Id, clientSecret);

                //Get new client secret
                var newSecret = await context.ClientSecrets.Where(x => x.Id == clientSecret.Id).SingleOrDefaultAsync();

                clientSecret.Should().BeEquivalentTo(newSecret,
                    options => options.Excluding(o => o.Id).Excluding(x => x.Client));
            }
        }

        [Fact]
        public async Task CloneClientAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0, generateClaims: true, generateProperties: true, generateSecrets: true);

                var clientRepository = GetClientRepository(context);

                //Add new client
                await clientRepository.AddClientAsync(client);

                var clientToClone = await context.Clients.Where(x => x.Id == client.Id).SingleOrDefaultAsync();

                //Try clone it - all client collections without secrets
                var clonedClientId = await clientRepository.CloneClientAsync(clientToClone);

                var cloneClientEntity = await clientRepository.GetClientAsync(clonedClientId);
                var clientToCompare = await clientRepository.GetClientAsync(clientToClone.Id);

                ClientCloneCompare(cloneClientEntity, clientToCompare);
            }
        }
        
        [Fact]
        public async Task CloneClientWithoutCorsAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0, generateClaims: true, generateProperties: true, generateSecrets: true);

                var clientRepository = GetClientRepository(context);

                //Add new client
                await clientRepository.AddClientAsync(client);

                var clientToClone = await context.Clients.Where(x => x.Id == client.Id).SingleOrDefaultAsync();

                //Try clone it
                var clonedClientId = await clientRepository.CloneClientAsync(clientToClone, cloneClientCorsOrigins: false);

                var cloneClientEntity = await clientRepository.GetClientAsync(clonedClientId);
                var clientToCompare = await clientRepository.GetClientAsync(clientToClone.Id);

                ClientCloneCompare(cloneClientEntity, clientToCompare, cloneClientCorsOrigins: false);
            }
        }

        [Fact]
        public async Task CloneClientWithoutClaimsAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0, generateClaims: true, generateProperties: true, generateSecrets: true);

                var clientRepository = GetClientRepository(context);

                //Add new client
                await clientRepository.AddClientAsync(client);

                var clientToClone = await context.Clients.Where(x => x.Id == client.Id).SingleOrDefaultAsync();

                //Try clone it
                var clonedClientId = await clientRepository.CloneClientAsync(clientToClone, cloneClientClaims: false);

                var cloneClientEntity = await clientRepository.GetClientAsync(clonedClientId);
                var clientToCompare = await clientRepository.GetClientAsync(clientToClone.Id);

                ClientCloneCompare(cloneClientEntity, clientToCompare, cloneClientClaims: false);
            }
        }

        [Fact]
        public async Task CloneClientWithoutPropertiesAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0, generateClaims: true, generateProperties: true, generateSecrets: true);

                var clientRepository = GetClientRepository(context);

                //Add new client
                await clientRepository.AddClientAsync(client);

                var clientToClone = await context.Clients.Where(x => x.Id == client.Id).SingleOrDefaultAsync();

                //Try clone it
                var clonedClientId = await clientRepository.CloneClientAsync(clientToClone, cloneClientProperties: false);

                var cloneClientEntity = await clientRepository.GetClientAsync(clonedClientId);
                var clientToCompare = await clientRepository.GetClientAsync(clientToClone.Id);

                ClientCloneCompare(cloneClientEntity, clientToCompare, cloneClientProperties: false);
            }
        }

        [Fact]
        public async Task CloneClientWithoutGrantTypesAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0, generateClaims: true, generateProperties: true, generateSecrets: true);

                var clientRepository = GetClientRepository(context);

                //Add new client
                await clientRepository.AddClientAsync(client);

                var clientToClone = await context.Clients.Where(x => x.Id == client.Id).SingleOrDefaultAsync();

                //Try clone it
                var clonedClientId = await clientRepository.CloneClientAsync(clientToClone, cloneClientGrantTypes: false);

                var cloneClientEntity = await clientRepository.GetClientAsync(clonedClientId);
                var clientToCompare = await clientRepository.GetClientAsync(clientToClone.Id);

                ClientCloneCompare(cloneClientEntity, clientToCompare, cloneClientGrantTypes: false);
            }
        }

        [Fact]
        public async Task CloneClientWithoutIdPRestrictionsAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0, generateClaims: true, generateProperties: true, generateSecrets: true);

                var clientRepository = GetClientRepository(context);

                //Add new client
                await clientRepository.AddClientAsync(client);

                var clientToClone = await context.Clients.Where(x => x.Id == client.Id).SingleOrDefaultAsync();

                //Try clone it
                var clonedClientId = await clientRepository.CloneClientAsync(clientToClone, cloneClientIdPRestrictions: false);

                var cloneClientEntity = await clientRepository.GetClientAsync(clonedClientId);
                var clientToCompare = await clientRepository.GetClientAsync(clientToClone.Id);

                ClientCloneCompare(cloneClientEntity, clientToCompare, cloneClientIdPRestrictions: false);
            }
        }

        [Fact]
        public async Task CloneClientWithoutPostLogoutRedirectUrisAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0, generateClaims: true, generateProperties: true, generateSecrets: true);

                var clientRepository = GetClientRepository(context);

                //Add new client
                await clientRepository.AddClientAsync(client);

                var clientToClone = await context.Clients.Where(x => x.Id == client.Id).SingleOrDefaultAsync();

                //Try clone it
                var clonedClientId = await clientRepository.CloneClientAsync(clientToClone, cloneClientPostLogoutRedirectUris: false);

                var cloneClientEntity = await clientRepository.GetClientAsync(clonedClientId);
                var clientToCompare = await clientRepository.GetClientAsync(clientToClone.Id);

                ClientCloneCompare(cloneClientEntity, clientToCompare, cloneClientPostLogoutRedirectUris: false);
            }
        }

        [Fact]
        public async Task CloneClientWithoutRedirectUrisAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0, generateClaims: true, generateProperties: true, generateSecrets: true);

                var clientRepository = GetClientRepository(context);

                //Add new client
                await clientRepository.AddClientAsync(client);

                var clientToClone = await context.Clients.Where(x => x.Id == client.Id).SingleOrDefaultAsync();

                //Try clone it
                var clonedClientId = await clientRepository.CloneClientAsync(clientToClone, cloneClientRedirectUris: false);

                var cloneClientEntity = await clientRepository.GetClientAsync(clonedClientId);
                var clientToCompare = await clientRepository.GetClientAsync(clientToClone.Id);

                ClientCloneCompare(cloneClientEntity, clientToCompare, cloneClientRedirectUris: false);
            }
        }

        [Fact]
        public async Task CloneClientWithoutScopesAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                //Generate random new client
                var client = ClientMock.GenerateRandomClient(0, generateClaims: true, generateProperties: true, generateSecrets: true);

                var clientRepository = GetClientRepository(context);

                //Add new client
                await clientRepository.AddClientAsync(client);

                var clientToClone = await context.Clients.Where(x => x.Id == client.Id).SingleOrDefaultAsync();

                //Try clone it
                var clonedClientId = await clientRepository.CloneClientAsync(clientToClone, cloneClientScopes: false);

                var cloneClientEntity = await clientRepository.GetClientAsync(clonedClientId);
                var clientToCompare = await clientRepository.GetClientAsync(clientToClone.Id);

                ClientCloneCompare(cloneClientEntity, clientToCompare, cloneClientScopes: false);
            }
        }

        [Fact]
        public async Task DeleteClientClaimAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);

                //Generate random new Client Claim
                var clientClaim = ClientMock.GenerateRandomClientClaim(0);

                //Add new client claim
                await clientRepository.AddClientClaimAsync(clientEntity.Id, clientClaim);

                //Get new client claim
                var newClientClaim =
                    await context.ClientClaims.Where(x => x.Id == clientClaim.Id).SingleOrDefaultAsync();

                //Assert
                clientClaim.Should().BeEquivalentTo(newClientClaim,
                    options => options.Excluding(o => o.Id).Excluding(x => x.Client));

                //Try delete it
                await clientRepository.DeleteClientClaimAsync(newClientClaim);

                //Get new client claim
                var deletedClientClaim =
                    await context.ClientClaims.Where(x => x.Id == clientClaim.Id).SingleOrDefaultAsync();

                //Assert
                deletedClientClaim.Should().BeNull();
            }
        }

        [Fact]
        public async Task DeleteClientPropertyAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);

                //Generate random new Client Property
                var clientProperty = ClientMock.GenerateRandomClientProperty(0);

                //Add new client property
                await clientRepository.AddClientPropertyAsync(clientEntity.Id, clientProperty);

                //Get new client property
                var newClientProperties = await context.ClientProperties.Where(x => x.Id == clientProperty.Id)
                    .SingleOrDefaultAsync();

                //Assert
                clientProperty.Should().BeEquivalentTo(newClientProperties,
                    options => options.Excluding(o => o.Id).Excluding(x => x.Client));

                //Try delete it
                await clientRepository.DeleteClientPropertyAsync(newClientProperties);

                //Get new client property
                var deletedClientProperty = await context.ClientProperties.Where(x => x.Id == clientProperty.Id)
                    .SingleOrDefaultAsync();

                //Assert
                deletedClientProperty.Should().BeNull();
            }
        }

        [Fact]
        public async Task DeleteClientSecretAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);

                //Generate random new Client Secret
                var clientSecret = ClientMock.GenerateRandomClientSecret(0);

                //Add new client secret
                await clientRepository.AddClientSecretAsync(clientEntity.Id, clientSecret);

                //Get new client secret
                var newSecret = await context.ClientSecrets.Where(x => x.Id == clientSecret.Id).SingleOrDefaultAsync();

                //Assert
                clientSecret.Should().BeEquivalentTo(newSecret,
                    options => options.Excluding(o => o.Id).Excluding(x => x.Client));

                //Try delete it
                await clientRepository.DeleteClientSecretAsync(newSecret);

                //Get new client secret
                var deletedSecret =
                    await context.ClientSecrets.Where(x => x.Id == clientSecret.Id).SingleOrDefaultAsync();

                //Assert
                deletedSecret.Should().BeNull();
            }
        }

        [Fact]
        public async Task GetClientAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);
            }
        }

        [Fact]
        public async Task GetClientClaimAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);

                //Generate random client claim
                var clientClaim = ClientMock.GenerateRandomClientClaim(0);

                //Add new client claim
                await clientRepository.AddClientClaimAsync(clientEntity.Id, clientClaim);

                //Get new client claim
                var newClientClaim = await clientRepository.GetClientClaimAsync(clientClaim.Id);

                clientClaim.Should().BeEquivalentTo(newClientClaim,
                    options => options.Excluding(o => o.Id).Excluding(x => x.Client));
            }
        }

        [Fact]
        public async Task GetClientPropertyAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);

                //Generate random new Client Property
                var clientProperty = ClientMock.GenerateRandomClientProperty(0);

                //Add new client Property
                await clientRepository.AddClientPropertyAsync(clientEntity.Id, clientProperty);

                //Get new client Property
                var newClientProperty = await clientRepository.GetClientPropertyAsync(clientProperty.Id);

                clientProperty.Should().BeEquivalentTo(newClientProperty,
                    options => options.Excluding(o => o.Id).Excluding(x => x.Client));
            }
        }

        [Fact]
        public async Task GetClientsAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                var rnd = new Random();
                var generateRows = rnd.Next(1, 10);

                //Generate random new clients
                var randomClients = ClientMock.GenerateRandomClients(0, generateRows);

                foreach (var client in randomClients)
                    //Add new client
                    await clientRepository.AddClientAsync(client);

                var clients = await clientRepository.GetClientsAsync();

                //Assert clients count
                clients.Data.Count.Should().Be(randomClients.Count);

                //Assert that clients are same
                randomClients.Should().BeEquivalentTo(clients.Data);
            }
        }

        [Fact]
        public async Task GetClientSecretAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await clientRepository.GetClientAsync(client.Id);

                //Assert new client
                ClientAssert(clientEntity, client);

                //Generate random new Client Secret
                var clientSecret = ClientMock.GenerateRandomClientSecret(0);

                //Add new client secret
                await clientRepository.AddClientSecretAsync(clientEntity.Id, clientSecret);

                //Get new client secret
                var newSecret = await clientRepository.GetClientSecretAsync(clientSecret.Id);

                clientSecret.Should().BeEquivalentTo(newSecret,
                    options => options.Excluding(o => o.Id).Excluding(x => x.Client));
            }
        }

        [Fact]
        public async Task RemoveClientAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await context.Clients.Where(x => x.Id == client.Id).SingleAsync();

                //Assert new client
                client.Should().BeEquivalentTo(clientEntity, options => options.Excluding(o => o.Id));

                //Detached the added item
                context.Entry(clientEntity).State = EntityState.Detached;

                //Remove client
                await clientRepository.RemoveClientAsync(clientEntity);

                //Try Get Removed client
                var removeClientEntity = await context.Clients.Where(x => x.Id == clientEntity.Id)
                    .SingleOrDefaultAsync();

                //Assert removed client - it might be null
                removeClientEntity.Should().BeNull();
            }
        }

        [Fact]
        public async Task UpdateClientAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Generate random new client without id
                var client = ClientMock.GenerateRandomClient(0);

                //Add new client
                await clientRepository.AddClientAsync(client);

                //Get new client
                var clientEntity = await context.Clients.Where(x => x.Id == client.Id).SingleAsync();

                //Assert new client
                client.Should().BeEquivalentTo(clientEntity, options => options.Excluding(o => o.Id));

                //Detached the added item
                context.Entry(clientEntity).State = EntityState.Detached;

                //Generete new client with added item id
                var updatedClient = ClientMock.GenerateRandomClient(clientEntity.Id);

                //Update client
                await clientRepository.UpdateClientAsync(updatedClient);

                //Get updated client
                var updatedClientEntity =
                    await context.Clients.Where(x => x.Id == updatedClient.Id).SingleAsync();

                //Assert updated client
                updatedClient.Should().BeEquivalentTo(updatedClientEntity);
            }
        }

        [Fact]
        public void GetGrantTypes()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Try get some existing grant
                var randomClientGrantType = ClientMock.GenerateRandomClientGrantType();

                var grantTypes = clientRepository.GetGrantTypes(randomClientGrantType.GrantType);
                grantTypes[0].Should().Be(randomClientGrantType.GrantType);
            }
        }

        [Fact]
        public void GetStandardClaims()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);

                //Try get some existing claims
                var randomClientClaim = ClientMock.GenerateRandomClientClaim(0);

                var grantTypes = clientRepository.GetStandardClaims(randomClientClaim.Type);
                grantTypes.Contains(randomClientClaim.Type).Should().Be(true);
            }
        }

        [Fact]
        public async Task GetScopesIdentityResourceAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);
                var identityResourceRepository = GetIdentityResourceRepository(context);
                
                var identityResource = IdentityResourceMock.GenerateRandomIdentityResource(0);
                await identityResourceRepository.AddIdentityResourceAsync(identityResource);
                
                var identityScopes = await clientRepository.GetScopesAsync(identityResource.Name);

                identityScopes[0].Should().Be(identityResource.Name);
            }
        }

        [Fact]
        public async Task GetScopesApiResourceAsync()
        {
            using (var context = new IdentityServerConfigurationDbContext(_dbContextOptions, _storeOptions))
            {
                var clientRepository = GetClientRepository(context);
                var apiScopeRepository = GetApiScopeRepository(context);
                
                var apiScope = ApiScopeMock.GenerateRandomApiScope(0);
                await apiScopeRepository.AddApiScopeAsync(apiScope);

                var apiScopes = await clientRepository.GetScopesAsync(apiScope.Name);

                apiScopes[0].Should().Be(apiScope.Name);
            }
        }
        
        private void ClientCloneCompare(Client cloneClientEntity, Client clientToCompare, bool cloneClientCorsOrigins = true, bool cloneClientGrantTypes = true, bool cloneClientIdPRestrictions = true, bool cloneClientPostLogoutRedirectUris = true, bool cloneClientScopes = true, bool cloneClientRedirectUris = true, bool cloneClientClaims = true, bool cloneClientProperties = true)
        {
            //Assert cloned client
            clientToCompare.Should().BeEquivalentTo(cloneClientEntity,
                options => options.Excluding(o => o.Id)
                    .Excluding(o => o.ClientSecrets)
                    .Excluding(o => o.ClientId)
                    .Excluding(o => o.ClientName)

                    //Skip the collections because is not possible ignore property in list :-(
                    //Note: I've found the solution above - try ignore property of the list using SelectedMemberPath                        
                    .Excluding(o => o.AllowedGrantTypes)
                    .Excluding(o => o.RedirectUris)
                    .Excluding(o => o.PostLogoutRedirectUris)
                    .Excluding(o => o.AllowedScopes)
                    .Excluding(o => o.ClientSecrets)
                    .Excluding(o => o.Claims)
                    .Excluding(o => o.IdentityProviderRestrictions)
                    .Excluding(o => o.AllowedCorsOrigins)
                    .Excluding(o => o.Properties)
            );


            //New client relations have new id's and client relations therefore is required ignore them
            if (cloneClientGrantTypes)
            {
                clientToCompare.AllowedGrantTypes.Should().BeEquivalentTo(cloneClientEntity.AllowedGrantTypes,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Client")));
            }
            else
            {
                cloneClientEntity.AllowedGrantTypes.Should().BeEmpty();
            }

            if (cloneClientCorsOrigins)
            {
                clientToCompare.AllowedCorsOrigins.Should().BeEquivalentTo(cloneClientEntity.AllowedCorsOrigins,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Client")));
            }
            else
            {
                cloneClientEntity.AllowedCorsOrigins.Should().BeEmpty();
            }

            if (cloneClientRedirectUris)
            {
                clientToCompare.RedirectUris.Should().BeEquivalentTo(cloneClientEntity.RedirectUris,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Client")));
            }
            else
            {
                cloneClientEntity.RedirectUris.Should().BeEmpty();
            }

            if (cloneClientPostLogoutRedirectUris)
            {
                clientToCompare.PostLogoutRedirectUris.Should().BeEquivalentTo(cloneClientEntity.PostLogoutRedirectUris,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Client")));
            }
            else
            {
                cloneClientEntity.PostLogoutRedirectUris.Should().BeEmpty();
            }

            if (cloneClientScopes)
            {
                clientToCompare.AllowedScopes.Should().BeEquivalentTo(cloneClientEntity.AllowedScopes,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Client")));
            }
            else
            {
                cloneClientEntity.AllowedScopes.Should().BeEmpty();
            }

            if (cloneClientClaims)
            {
                clientToCompare.Claims.Should().BeEquivalentTo(cloneClientEntity.Claims,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Client")));
            }
            else
            {
                cloneClientEntity.Claims.Should().BeEmpty();
            }

            if (cloneClientIdPRestrictions)
            {
                clientToCompare.IdentityProviderRestrictions.Should().BeEquivalentTo(cloneClientEntity.IdentityProviderRestrictions,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Client")));
            }
            else
            {
                cloneClientEntity.IdentityProviderRestrictions.Should().BeEmpty();
            }

            if (cloneClientProperties)
            {
                clientToCompare.Properties.Should().BeEquivalentTo(cloneClientEntity.Properties,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Client")));
            }
            else
            {
                cloneClientEntity.Properties.Should().BeEmpty();
            }

            cloneClientEntity.ClientSecrets.Should().BeEmpty();
        }

        private void ClientAssert(Client client, Client clientToCompare)
        {
            clientToCompare.Should().BeEquivalentTo(client,
                options => options.Excluding(o => o.Id)
                    .Excluding(o => o.ClientSecrets)
                    .Excluding(o => o.ClientId)
                    .Excluding(o => o.ClientName)

                    //Skip the collections because is not possible ignore property in list :-(
                    //Note: I've found the solution above - try ignore property of the list using SelectedMemberPath                        
                    .Excluding(o => o.AllowedGrantTypes)
                    .Excluding(o => o.RedirectUris)
                    .Excluding(o => o.PostLogoutRedirectUris)
                    .Excluding(o => o.AllowedScopes)
                    .Excluding(o => o.ClientSecrets)
                    .Excluding(o => o.Claims)
                    .Excluding(o => o.IdentityProviderRestrictions)
                    .Excluding(o => o.AllowedCorsOrigins)
                    .Excluding(o => o.Properties)
            );

            clientToCompare.AllowedGrantTypes.Should().BeEquivalentTo(client.AllowedGrantTypes,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Client")));

            clientToCompare.AllowedCorsOrigins.Should().BeEquivalentTo(client.AllowedCorsOrigins,
                option => option.Excluding(x => x.Path.EndsWith("Id"))
                    .Excluding(x => x.Path.EndsWith("Client")));

            clientToCompare.RedirectUris.Should().BeEquivalentTo(client.RedirectUris,
                option => option.Excluding(x => x.Path.EndsWith("Id"))
                    .Excluding(x => x.Path.EndsWith("Client")));

            clientToCompare.PostLogoutRedirectUris.Should().BeEquivalentTo(client.PostLogoutRedirectUris,
                option => option.Excluding(x => x.Path.EndsWith("Id"))
                    .Excluding(x => x.Path.EndsWith("Client")));

            clientToCompare.AllowedScopes.Should().BeEquivalentTo(client.AllowedScopes,
                option => option.Excluding(x => x.Path.EndsWith("Id"))
                    .Excluding(x => x.Path.EndsWith("Client")));

            clientToCompare.ClientSecrets.Should().BeEquivalentTo(client.ClientSecrets,
                option => option.Excluding(x => x.Path.EndsWith("Id"))
                    .Excluding(x => x.Path.EndsWith("Client")));

            clientToCompare.Claims.Should().BeEquivalentTo(client.Claims,
                option => option.Excluding(x => x.Path.EndsWith("Id"))
                    .Excluding(x => x.Path.EndsWith("Client")));

            clientToCompare.IdentityProviderRestrictions.Should().BeEquivalentTo(
                client.IdentityProviderRestrictions,
                option => option.Excluding(x => x.Path.EndsWith("Id"))
                    .Excluding(x => x.Path.EndsWith("Client")));

            clientToCompare.Properties.Should().BeEquivalentTo(client.Properties,
                option => option.Excluding(x => x.Path.EndsWith("Id"))
                    .Excluding(x => x.Path.EndsWith("Client")));
        }
    }
}