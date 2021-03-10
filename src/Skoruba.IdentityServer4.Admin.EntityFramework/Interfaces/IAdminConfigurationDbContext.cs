using Duende.IdentityServer.EntityFramework.Entities;
using Duende.IdentityServer.EntityFramework.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Interfaces
{
    public interface IAdminConfigurationDbContext : IConfigurationDbContext
    {
        DbSet<ApiResourceSecret> ApiSecrets { get; set; }

        DbSet<ApiScopeClaim> ApiScopeClaims { get; set; }

        DbSet<IdentityResourceClaim> IdentityClaims { get; set; }

        DbSet<ApiResourceClaim> ApiResourceClaims { get; set; }

        DbSet<ClientGrantType> ClientGrantTypes { get; set; }

        DbSet<ClientScope> ClientScopes { get; set; }

        DbSet<ClientSecret> ClientSecrets { get; set; }

        DbSet<ClientPostLogoutRedirectUri> ClientPostLogoutRedirectUris { get; set; }

        DbSet<ClientIdPRestriction> ClientIdPRestrictions { get; set; }

        DbSet<ClientRedirectUri> ClientRedirectUris { get; set; }

        DbSet<ClientClaim> ClientClaims { get; set; }

        DbSet<ClientProperty> ClientProperties { get; set; }

        DbSet<IdentityResourceProperty> IdentityResourceProperties { get; set; }

        DbSet<ApiResourceProperty> ApiResourceProperties { get; set; }

        DbSet<ApiScopeProperty> ApiScopeProperties { get; set; }

        DbSet<ApiResourceScope> ApiResourceScopes { get; set; }
    }
}
