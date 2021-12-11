// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Threading;
using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Common;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces
{
    public interface IKeyRepository
    {
        Task<PagedList<Key>> GetKeysAsync(int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
        Task<Key> GetKeyAsync(string id, CancellationToken cancellationToken = default);
        Task<bool> ExistsKeyAsync(string id, CancellationToken cancellationToken = default);
        Task DeleteKeyAsync(string id, CancellationToken cancellationToken = default);
        Task<int> SaveAllChangesAsync(CancellationToken cancellationToken = default);
        bool AutoSaveChanges { get; set; }
    }
}