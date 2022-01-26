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
    public class IdentityResourceRepositoryTests
    {

        private IIdentityResourceRepository GetIdentityResourceRepository(IdentityServerConfigurationDbContext context)
        {
            IIdentityResourceRepository identityResourceRepository = new IdentityResourceRepository<IdentityServerConfigurationDbContext>(context);

            return identityResourceRepository;
        }

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

        [Fact]
        public async Task AddIdentityResourceAsync()
        {
            using (var context = GetDbContext())
            {
                var identityResourceRepository = GetIdentityResourceRepository(context);

                //Generate random new identity resource
                var identityResource = IdentityResourceMock.GenerateRandomIdentityResource(0);

                //Add new identity resource
                await identityResourceRepository.AddIdentityResourceAsync(identityResource);

                //Get new identity resource
                var newIdentityResource = await context.IdentityResources.Where(x => x.Id == identityResource.Id).SingleAsync();

                //Assert new identity resource
                identityResource.Should().BeEquivalentTo(newIdentityResource, options => options.Excluding(o => o.Id));
            }
        }

        [Fact]
        public async Task GetIdentityResourceAsync()
        {
            using (var context = GetDbContext())
            {
                var identityResourceRepository = GetIdentityResourceRepository(context);

                //Generate random new identity resource
                var identityResource = IdentityResourceMock.GenerateRandomIdentityResource(0);

                //Add new identity resource
                await identityResourceRepository.AddIdentityResourceAsync(identityResource);

                //Get new identity resource
                var newIdentityResource = await identityResourceRepository.GetIdentityResourceAsync(identityResource.Id);

                //Assert new identity resource
                identityResource.Should().BeEquivalentTo(newIdentityResource, options => options.Excluding(o => o.Id).Excluding(o => o.UserClaims));

                identityResource.UserClaims.Should().BeEquivalentTo(newIdentityResource.UserClaims,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("IdentityResource")));
            }
        }

        [Fact]
        public async Task DeleteIdentityResourceAsync()
        {
            using (var context = GetDbContext())
            {
                var identityResourceRepository = GetIdentityResourceRepository(context);

                //Generate random new identity resource
                var identityResource = IdentityResourceMock.GenerateRandomIdentityResource(0);

                //Add new identity resource
                await identityResourceRepository.AddIdentityResourceAsync(identityResource);

                //Get new identity resource
                var newIdentityResource = await context.IdentityResources.Where(x => x.Id == identityResource.Id).SingleAsync();

                //Assert new identity resource
                identityResource.Should().BeEquivalentTo(newIdentityResource, options => options.Excluding(o => o.Id));

                //Delete identity resource
                await identityResourceRepository.DeleteIdentityResourceAsync(newIdentityResource);

                //Get deleted identity resource
                var deletedIdentityResource = await context.IdentityResources.Where(x => x.Id == identityResource.Id).SingleOrDefaultAsync();

                //Assert if it not exist
                deletedIdentityResource.Should().BeNull();
            }
        }

        [Fact]
        public async Task UpdateIdentityResourceAsync()
        {
            using (var context = GetDbContext())
            {
                var identityResourceRepository = GetIdentityResourceRepository(context);

                //Generate random new identity resource
                var identityResource = IdentityResourceMock.GenerateRandomIdentityResource(0);

                //Add new identity resource
                await identityResourceRepository.AddIdentityResourceAsync(identityResource);

                //Get new identity resource
                var newIdentityResource = await context.IdentityResources.Where(x => x.Id == identityResource.Id).SingleOrDefaultAsync();

                //Assert new identity resource
                identityResource.Should().BeEquivalentTo(newIdentityResource, options => options.Excluding(o => o.Id));

                //Detached the added item
                context.Entry(newIdentityResource).State = EntityState.Detached;

                //Generete new identity resource with added item id
                var updatedIdentityResource = IdentityResourceMock.GenerateRandomIdentityResource(newIdentityResource.Id);

                //Update identity resource
                await identityResourceRepository.UpdateIdentityResourceAsync(updatedIdentityResource);

                //Get updated identity resource
                var updatedIdentityResourceEntity = await context.IdentityResources.Where(x => x.Id == updatedIdentityResource.Id).SingleAsync();

                //Assert updated identity resource
                updatedIdentityResourceEntity.Should().BeEquivalentTo(updatedIdentityResource);
            }
        }

		[Fact]
		public async Task AddIdentityResourcePropertyAsync()
		{
			using (var context = GetDbContext())
			{
				var identityResourceRepository = GetIdentityResourceRepository(context);

				//Generate random new identity resource without id
				var identityResource = IdentityResourceMock.GenerateRandomIdentityResource(0);

				//Add new identity resource
				await identityResourceRepository.AddIdentityResourceAsync(identityResource);

				//Get new identity resource
				var resource = await identityResourceRepository.GetIdentityResourceAsync(identityResource.Id);

                //Assert new identity resource
                identityResource.Should().BeEquivalentTo(resource, options => options.Excluding(o => o.Id)
                    .Excluding(o => o.UserClaims));

                identityResource.UserClaims.Should().BeEquivalentTo(resource.UserClaims,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("IdentityResource")));

                //Generate random new identity resource property
                var identityResourceProperty = IdentityResourceMock.GenerateRandomIdentityResourceProperty(0);

				//Add new identity resource property
				await identityResourceRepository.AddIdentityResourcePropertyAsync(resource.Id, identityResourceProperty);

				//Get new identity resource property
				var resourceProperty = await context.IdentityResourceProperties.Where(x => x.Id == identityResourceProperty.Id)
					.SingleOrDefaultAsync();

                identityResourceProperty.Should().BeEquivalentTo(resourceProperty,
					options => options.Excluding(o => o.Id).Excluding(x => x.IdentityResource));
			}
		}

		[Fact]
		public async Task DeleteIdentityResourcePropertyAsync()
		{
			using (var context = GetDbContext())
			{
				var identityResourceRepository = GetIdentityResourceRepository(context);

				//Generate random new identity resource without id
				var identityResource = IdentityResourceMock.GenerateRandomIdentityResource(0);

				//Add new identity resource
				await identityResourceRepository.AddIdentityResourceAsync(identityResource);

				//Get new identity resource
				var resource = await identityResourceRepository.GetIdentityResourceAsync(identityResource.Id);

                //Assert new identity resource
                identityResource.Should().BeEquivalentTo(resource, options => options.Excluding(o => o.Id).Excluding(o => o.UserClaims));

                identityResource.UserClaims.Should().BeEquivalentTo(resource.UserClaims,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("IdentityResource")));

                //Generate random new identity resource property
                var identityResourceProperty = IdentityResourceMock.GenerateRandomIdentityResourceProperty(0);

				//Add new identity resource property
				await identityResourceRepository.AddIdentityResourcePropertyAsync(resource.Id, identityResourceProperty);

				//Get new identity resource property
				var property = await context.IdentityResourceProperties.Where(x => x.Id == identityResourceProperty.Id)
					.SingleOrDefaultAsync();

                //Assert
                identityResourceProperty.Should().BeEquivalentTo(property,
					options => options.Excluding(o => o.Id).Excluding(x => x.IdentityResource));

				//Try delete it
				await identityResourceRepository.DeleteIdentityResourcePropertyAsync(property);

				//Get new identity resource property
				var resourceProperty = await context.IdentityResourceProperties.Where(x => x.Id == identityResourceProperty.Id)
					.SingleOrDefaultAsync();

				//Assert
				resourceProperty.Should().BeNull();
			}
		}

		[Fact]
		public async Task GetIdentityResourcePropertyAsync()
		{
			using (var context = GetDbContext())
			{
				var identityResourceRepository = GetIdentityResourceRepository(context);

				//Generate random new identity resource without id
				var identityResource = IdentityResourceMock.GenerateRandomIdentityResource(0);

				//Add new identity resource
				await identityResourceRepository.AddIdentityResourceAsync(identityResource);

				//Get new identity resource
				var resource = await identityResourceRepository.GetIdentityResourceAsync(identityResource.Id);

                //Assert new identity resource
                identityResource.Should().BeEquivalentTo(resource, options => options.Excluding(o => o.Id).Excluding(o => o.UserClaims));

                identityResource.UserClaims.Should().BeEquivalentTo(resource.UserClaims,
                    option => option.Excluding(x => x.Path.EndsWith("Id"))
                        .Excluding(x => x.Path.EndsWith("IdentityResource")));

                //Generate random new identity resource property
                var identityResourceProperty = IdentityResourceMock.GenerateRandomIdentityResourceProperty(0);

				//Add new identity resource property
				await identityResourceRepository.AddIdentityResourcePropertyAsync(resource.Id, identityResourceProperty);

				//Get new identity resource property
				var resourceProperty = await identityResourceRepository.GetIdentityResourcePropertyAsync(identityResourceProperty.Id);

                identityResourceProperty.Should().BeEquivalentTo(resourceProperty,
					options => options.Excluding(o => o.Id).Excluding(x => x.IdentityResource));
			}
		}
	}
}
