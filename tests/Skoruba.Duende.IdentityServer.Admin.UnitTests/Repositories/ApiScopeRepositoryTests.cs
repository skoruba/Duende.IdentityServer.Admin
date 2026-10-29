// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Options;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Repositories
{
    public class ApiScopeRepositoryTests
    {
        private IdentityServerConfigurationDbContext GetDbContext()
        {
            var serviceCollection = new ServiceCollection();

            serviceCollection.AddSingleton(new ConfigurationStoreOptions());
            serviceCollection.AddSingleton(new OperationalStoreOptions());

            serviceCollection.AddDbContext<IdentityServerConfigurationDbContext>(builder => builder.UseInMemoryDatabase(Guid.NewGuid().ToString()));

            var serviceProvider = serviceCollection.BuildServiceProvider();
            var context = serviceProvider.GetService<IdentityServerConfigurationDbContext>();

            return context;
        }

        private IApiScopeRepository GetApiScopeRepository(IdentityServerConfigurationDbContext context)
        {
            IApiScopeRepository apiScopeRepository = new ApiScopeRepository<IdentityServerConfigurationDbContext>(context);

            return apiScopeRepository;
        }

        [Fact]
        public async Task AddApiScopeAsync()
        {
            using (var context = GetDbContext())
            {
                var apiResourceRepository = GetApiScopeRepository(context);

                //Generate random new api scope
                var apiScope = ApiScopeMock.GenerateRandomApiScope(0);

                //Add new api scope
                await apiResourceRepository.AddApiScopeAsync(apiScope);

                //Get new api scope
                var newApiScopes = await context.ApiScopes.Where(x => x.Id == apiScope.Id).SingleAsync();

                //Assert new api scope
                apiScope.Should().BeEquivalentTo(newApiScopes, options => options.Excluding(o => o.Id));
            }
        }

        [Fact]
        public async Task UpdateApiScopeAsync()
        {
            using (var context = GetDbContext())
            {
                var apiResourceRepository = GetApiScopeRepository(context);

                //Generate random new api scope
                var apiScope = ApiScopeMock.GenerateRandomApiScope(0);

                //Add new api scope
                await apiResourceRepository.AddApiScopeAsync(apiScope);

                //Detached the added item
                context.Entry(apiScope).State = EntityState.Detached;

                //Generete new api scope with added item id
                var updatedApiScope = ApiScopeMock.GenerateRandomApiScope(apiScope.Id);

                //Update api scope
                await apiResourceRepository.UpdateApiScopeAsync(updatedApiScope);

                //Get updated api scope
                var updatedApiScopeEntity = await context.ApiScopes.Where(x => x.Id == updatedApiScope.Id).SingleAsync();

                //Assert updated api scope
                updatedApiScopeEntity.Should().BeEquivalentTo(updatedApiScope);
            }
        }

        [Fact]
        public async Task DeleteApiScopeAsync()
        {
            using (var context = GetDbContext())
            {
                var apiResourceRepository = GetApiScopeRepository(context);

                //Generate random new api scope
                var apiScope = ApiScopeMock.GenerateRandomApiScope(0);

                //Add new api resource
                await apiResourceRepository.AddApiScopeAsync(apiScope);

                //Get new api resource
                var newApiScopes = await context.ApiScopes.Where(x => x.Id == apiScope.Id).SingleOrDefaultAsync();

                //Assert new api resource
                apiScope.Should().BeEquivalentTo(newApiScopes, options => options.Excluding(o => o.Id));

                //Try delete it
                await apiResourceRepository.DeleteApiScopeAsync(newApiScopes);

                //Get new api scope
                var deletedApiScopes = await context.ApiScopes.Where(x => x.Id == newApiScopes.Id).SingleOrDefaultAsync();

                //Assert if it exist
                deletedApiScopes.Should().BeNull();
            }
        }

        [Fact]
        public async Task GetApiScopeAsync()
        {
            using (var context = GetDbContext())
            {
                var apiResourceRepository = GetApiScopeRepository(context);

                //Generate random new api scope
                var apiScope = ApiScopeMock.GenerateRandomApiScope(0);

                //Add new api scope
                await apiResourceRepository.AddApiScopeAsync(apiScope);

                //Get new api scope
                var newApiScopes = await apiResourceRepository.GetApiScopeAsync(apiScope.Id);

                //Assert new api resource
                apiScope.Should().BeEquivalentTo(newApiScopes, options => options.Excluding(o => o.Id)
                    .Excluding(o => o.UserClaims));

                apiScope.UserClaims.Should().BeEquivalentTo(newApiScopes.UserClaims,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("Scope")));
            }
        }

        [Fact]
        public async Task CanInsertApiScopeAsync_ReturnsFalse_WhenIdentityResourceWithSameNameExists()
        {
            using (var context = GetDbContext())
            {
                var apiScopeRepository = GetApiScopeRepository(context);

                var identityResource = IdentityResourceMock.GenerateRandomIdentityResource(0);
                await context.IdentityResources.AddAsync(identityResource);
                await context.SaveChangesAsync();

                var apiScope = ApiScopeMock.GenerateRandomApiScope(0);
                apiScope.Name = identityResource.Name;

                var canInsert = await apiScopeRepository.CanInsertApiScopeAsync(apiScope);

                canInsert.Should().BeFalse();
            }
        }

        [Fact]
        public async Task UpdateApiScopeAsyncKeepsValuesTheUpdateDoesNotCarry()
        {
            using (var context = GetDbContext())
            {
                var apiScopeRepository = GetApiScopeRepository(context);

                var apiScope = ApiScopeMock.GenerateRandomApiScope(0);
                apiScope.Created = new DateTime(2020, 1, 2, 3, 4, 5, DateTimeKind.Utc);
                apiScope.LastAccessed = new DateTime(2021, 2, 3, 4, 5, 6, DateTimeKind.Utc);
                apiScope.NonEditable = true;
                await apiScopeRepository.AddApiScopeAsync(apiScope);
                context.ChangeTracker.Clear();

                //The update comes without these values, as from the API
                var updatedApiScope = ApiScopeMock.GenerateRandomApiScope(apiScope.Id);
                updatedApiScope.Created = DateTime.UtcNow;
                updatedApiScope.LastAccessed = null;
                updatedApiScope.NonEditable = false;
                await apiScopeRepository.UpdateApiScopeAsync(updatedApiScope);
                context.ChangeTracker.Clear();

                var storedApiScope = await context.ApiScopes.SingleAsync(x => x.Id == apiScope.Id);
                storedApiScope.Created.Should().Be(apiScope.Created);
                storedApiScope.Updated.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
                storedApiScope.LastAccessed.Should().Be(apiScope.LastAccessed);
                storedApiScope.NonEditable.Should().BeTrue();
                storedApiScope.Name.Should().Be(updatedApiScope.Name);
            }
        }
    }
}
