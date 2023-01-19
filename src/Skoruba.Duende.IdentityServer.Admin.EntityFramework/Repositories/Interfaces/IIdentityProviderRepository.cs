// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Common;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces
{
    public interface IIdentityProviderRepository
    {
        Task<PagedList<IdentityProvider>> GetIdentityProvidersAsync(string search, int page = 1, int pageSize = 10);

        Task<IdentityProvider> GetIdentityProviderAsync(int identityProviderId);

        Task<bool> CanInsertIdentityProviderAsync(IdentityProvider identityProvider);

        Task<int> AddIdentityProviderAsync(IdentityProvider identityProvider);

        Task<int> UpdateIdentityProviderAsync(IdentityProvider identityProvider);

        Task<int> DeleteIdentityProviderAsync(IdentityProvider identityProvider);

        Task<int> SaveAllChangesAsync();

        bool AutoSaveChanges { get; set; }
    }
}