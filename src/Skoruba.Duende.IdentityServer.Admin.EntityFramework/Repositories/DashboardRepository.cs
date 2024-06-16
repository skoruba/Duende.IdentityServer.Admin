using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skoruba.AuditLogging.EntityFramework.DbContexts;
using Skoruba.AuditLogging.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories;

public class DashboardRepository<TDbContext> : IDashboardRepository
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    protected readonly TDbContext DbContext;

    public DashboardRepository(TDbContext dbContext)
    {
        DbContext = dbContext;
    }

    public async Task<DashboardDataView> GetDashboardIdentityServerAsync(int auditLogsLastNumberOfDays, CancellationToken cancellationToken = default)
    {
        return new DashboardDataView
        {
            ClientsTotal = await DbContext.Clients.CountAsync(cancellationToken: cancellationToken),
            ApiResourcesTotal = await DbContext.ApiResources.CountAsync(cancellationToken: cancellationToken),
            ApiScopesTotal = await DbContext.ApiScopes.CountAsync(cancellationToken: cancellationToken),
            IdentityResourcesTotal = await DbContext.IdentityResources.CountAsync(cancellationToken: cancellationToken),
            IdentityProvidersTotal = await DbContext.IdentityProviders.CountAsync(cancellationToken: cancellationToken)
        };
    }
}