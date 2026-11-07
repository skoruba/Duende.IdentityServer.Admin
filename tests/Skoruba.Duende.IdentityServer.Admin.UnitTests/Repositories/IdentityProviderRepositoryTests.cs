// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Entities;
using Duende.IdentityServer.EntityFramework.Options;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Repositories
{
    public class IdentityProviderRepositoryTests
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

        private IIdentityProviderRepository GetIdentityProviderRepository(IdentityServerConfigurationDbContext context)
        {
            IIdentityProviderRepository identityProviderRepository = new IdentityProviderRepository<IdentityServerConfigurationDbContext>(context);

            return identityProviderRepository;
        }

        private static IdentityProvider GenerateIdentityProvider(int id, string displayName)
        {
            return new IdentityProvider
            {
                Id = id,
                Scheme = "oidc_provider",
                DisplayName = displayName,
                Type = "oidc",
                Enabled = true,
                Properties = "{}"
            };
        }

        [Fact]
        public async Task UpdateIdentityProviderAsyncKeepsValuesTheUpdateDoesNotCarry()
        {
            using (var context = GetDbContext())
            {
                var identityProviderRepository = GetIdentityProviderRepository(context);

                var identityProvider = GenerateIdentityProvider(0, "Provider");
                identityProvider.Created = new DateTime(2020, 1, 2, 3, 4, 5, DateTimeKind.Utc);
                identityProvider.LastAccessed = new DateTime(2021, 2, 3, 4, 5, 6, DateTimeKind.Utc);
                identityProvider.NonEditable = true;
                await identityProviderRepository.AddIdentityProviderAsync(identityProvider);
                context.ChangeTracker.Clear();

                //The update comes without these values, as from the API
                var updatedIdentityProvider = GenerateIdentityProvider(identityProvider.Id, "Provider updated");
                await identityProviderRepository.UpdateIdentityProviderAsync(updatedIdentityProvider);
                context.ChangeTracker.Clear();

                var storedIdentityProvider = await context.IdentityProviders.SingleAsync(x => x.Id == identityProvider.Id);
                storedIdentityProvider.Created.Should().Be(identityProvider.Created);
                storedIdentityProvider.Updated.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
                storedIdentityProvider.LastAccessed.Should().Be(identityProvider.LastAccessed);
                storedIdentityProvider.NonEditable.Should().BeTrue();
                storedIdentityProvider.DisplayName.Should().Be("Provider updated");
            }
        }
    }
}
