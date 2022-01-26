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
    }
}
