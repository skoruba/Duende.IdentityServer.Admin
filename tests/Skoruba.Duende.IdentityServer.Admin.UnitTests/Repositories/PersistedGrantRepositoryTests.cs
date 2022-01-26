// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Options;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.Entities.Identity;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Repositories
{
    public class PersistedGrantRepositoryTests
    {
        public PersistedGrantRepositoryTests()
        {
            var identityDatabaseName = Guid.NewGuid().ToString();
            
            _identityDbContextOptions = new DbContextOptionsBuilder<AdminIdentityDbContext>()
                .UseInMemoryDatabase(identityDatabaseName)
                .Options;
            
        }
        
        private readonly DbContextOptions<AdminIdentityDbContext> _identityDbContextOptions;

        private IdentityServerPersistedGrantDbContext GetDbContext()
        {
            var serviceCollection = new ServiceCollection();

            serviceCollection.AddSingleton(new ConfigurationStoreOptions());
            serviceCollection.AddSingleton(new OperationalStoreOptions());

            serviceCollection.AddDbContext<IdentityServerPersistedGrantDbContext>(builder => builder.UseInMemoryDatabase(Guid.NewGuid().ToString()));
            
            var serviceProvider = serviceCollection.BuildServiceProvider();
            var context = serviceProvider.GetService<IdentityServerPersistedGrantDbContext>();

            return context;
        }

        private IPersistedGrantAspNetIdentityRepository GetPersistedGrantRepository(AdminIdentityDbContext identityDbContext, IdentityServerPersistedGrantDbContext context)
        {
            var persistedGrantRepository = new PersistedGrantAspNetIdentityRepository<AdminIdentityDbContext, IdentityServerPersistedGrantDbContext, UserIdentity, UserIdentityRole, string, UserIdentityUserClaim, UserIdentityUserRole, UserIdentityUserLogin, UserIdentityRoleClaim, UserIdentityUserToken>(identityDbContext, context);

            return persistedGrantRepository;
        }

        [Fact]
        public async Task GetPersistedGrantAsync()
        {
            using (var context = GetDbContext())
            {
                using (var identityDbContext = new AdminIdentityDbContext(_identityDbContextOptions))
                {
                    var persistedGrantRepository = GetPersistedGrantRepository(identityDbContext, context);

                    //Generate persisted grant
                    var persistedGrantKey = Guid.NewGuid().ToString();
                    var persistedGrant = PersistedGrantMock.GenerateRandomPersistedGrant(persistedGrantKey);

                    //Try add new persisted grant
                    await context.PersistedGrants.AddAsync(persistedGrant);
                    await context.SaveChangesAsync();

                    //Try get persisted grant
                    var persistedGrantAdded = await persistedGrantRepository.GetPersistedGrantAsync(persistedGrantKey);

                    //Assert
                    persistedGrantAdded.Should().BeEquivalentTo(persistedGrant, opt => opt.Excluding(x => x.Key));
                }
            }
        }

        [Fact]
        public async Task DeletePersistedGrantAsync()
        {
            using (var context = GetDbContext())
            {
                using (var identityDbContext = new AdminIdentityDbContext(_identityDbContextOptions))
                {
                    var persistedGrantRepository = GetPersistedGrantRepository(identityDbContext, context);

                    //Generate persisted grant
                    var persistedGrantKey = Guid.NewGuid().ToString();
                    var persistedGrant = PersistedGrantMock.GenerateRandomPersistedGrant(persistedGrantKey);

                    //Try add new persisted grant
                    await context.PersistedGrants.AddAsync(persistedGrant);
                    await context.SaveChangesAsync();

                    //Try delete persisted grant
                    await persistedGrantRepository.DeletePersistedGrantAsync(persistedGrantKey);

                    var grant = await persistedGrantRepository.GetPersistedGrantAsync(persistedGrantKey);

                    //Assert
                    grant.Should().BeNull();
                }
            }
        }

        [Fact]
        public async Task DeletePersistedGrantsAsync()
        {
            using (var context = GetDbContext())
            {
                using (var identityDbContext = new AdminIdentityDbContext(_identityDbContextOptions))
                {
                    var persistedGrantRepository = GetPersistedGrantRepository(identityDbContext, context);

                    var subjectId = 1;

                    for (var i = 0; i < 4; i++)
                    {
                        //Generate persisted grant
                        var persistedGrantKey = Guid.NewGuid().ToString();
                        var persistedGrant =
                            PersistedGrantMock.GenerateRandomPersistedGrant(persistedGrantKey, subjectId.ToString());

                        //Try add new persisted grant
                        await context.PersistedGrants.AddAsync(persistedGrant);
                    }

                    await context.SaveChangesAsync();

                    //Try delete persisted grant
                    await persistedGrantRepository.DeletePersistedGrantsAsync(subjectId.ToString());

                    var grant = await persistedGrantRepository.GetPersistedGrantsByUserAsync(subjectId.ToString());

                    //Assert
                    grant.TotalCount.Should().Be(0);
                }
            }
        }
    }
}