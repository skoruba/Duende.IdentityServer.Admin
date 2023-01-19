// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Entities;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Common;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Enums;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Extensions;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories
{
    public class IdentityProviderRepository<TDbContext> : IIdentityProviderRepository
        where TDbContext : DbContext, IAdminConfigurationDbContext
    {
        protected readonly TDbContext DbContext;

        public bool AutoSaveChanges { get; set; } = true;

        public IdentityProviderRepository(TDbContext dbContext)
        {
            DbContext = dbContext;
        }

        public virtual async Task<PagedList<IdentityProvider>> GetIdentityProvidersAsync(string search, int page = 1, int pageSize = 10)
        {
            var pagedList = new PagedList<IdentityProvider>();

            Expression<Func<IdentityProvider, bool>> searchCondition = x => x.Scheme.Contains(search) || x.DisplayName.Contains(search);

            var identityProviders = await DbContext.IdentityProviders.WhereIf(!string.IsNullOrEmpty(search), searchCondition).PageBy(x => x.Scheme, page, pageSize).ToListAsync();

            pagedList.Data.AddRange(identityProviders);
            pagedList.TotalCount = await DbContext.IdentityProviders.WhereIf(!string.IsNullOrEmpty(search), searchCondition).CountAsync();
            pagedList.PageSize = pageSize;

            return pagedList;
        }

        public virtual Task<IdentityProvider> GetIdentityProviderAsync(int identityProviderId)
        {
            return DbContext.IdentityProviders
                .Where(x => x.Id == identityProviderId)
                .AsNoTracking()
                .SingleOrDefaultAsync();
        }

        /// <summary>
        /// Add new identityProvider
        /// </summary>
        /// <param name="identityProvider"></param>
        /// <returns>This method return new identityProvider id</returns>
        public virtual async Task<int> AddIdentityProviderAsync(IdentityProvider identityProvider)
        {
            DbContext.IdentityProviders.Add(identityProvider);

            await AutoSaveChangesAsync();

            return identityProvider.Id;
        }

        public virtual async Task<bool> CanInsertIdentityProviderAsync(IdentityProvider identityProvider)
        {
            if (identityProvider.Id == 0)
            {
                var existsWithSameName = await DbContext.IdentityProviders.Where(x => x.Scheme == identityProvider.Scheme).SingleOrDefaultAsync();
                return existsWithSameName == null;
            }
            else
            {
                var existsWithSameName = await DbContext.IdentityProviders.Where(x => x.Scheme == identityProvider.Scheme && x.Id != identityProvider.Id).SingleOrDefaultAsync();
                return existsWithSameName == null;
            }
        }
        
        public virtual async Task<int> DeleteIdentityProviderAsync(IdentityProvider identityProvider)
        {
            var identityProviderToDelete = await DbContext.IdentityProviders.Where(x => x.Id == identityProvider.Id).SingleOrDefaultAsync();

            DbContext.IdentityProviders.Remove(identityProviderToDelete);
            return await AutoSaveChangesAsync();
        }

        public virtual async Task<int> UpdateIdentityProviderAsync(IdentityProvider identityProvider)
        {
            //Update with new data
            DbContext.IdentityProviders.Update(identityProvider);

            return await AutoSaveChangesAsync();
        }

        protected virtual async Task<int> AutoSaveChangesAsync()
        {
            return AutoSaveChanges ? await DbContext.SaveChangesAsync() : (int)SavedStatus.WillBeSavedExplicitly;
        }

        public virtual async Task<int> SaveAllChangesAsync()
        {
            return await DbContext.SaveChangesAsync();
        }
    }
}