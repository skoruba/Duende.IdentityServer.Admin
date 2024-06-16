using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.Repositories;

public class DashboardIdentityRepository<TUser, TKey, TRole> : IDashboardIdentityRepository
    where TKey : IEquatable<TKey>
    where TUser : IdentityUser<TKey>
    where TRole : IdentityRole<TKey>
{
    protected readonly UserManager<TUser> UserManager;
    protected readonly RoleManager<TRole> RoleManager;

    public DashboardIdentityRepository(UserManager<TUser> userManager, RoleManager<TRole> roleManager)
    {
        UserManager = userManager;
        RoleManager = roleManager;
    }
    
    public Task<int> GetUsersTotalCountAsync(CancellationToken cancellationToken = default)
    {
       return UserManager.Users.CountAsync(cancellationToken: cancellationToken);
    }

    public Task<int> GetRolesTotalCountAsync(CancellationToken cancellationToken = default)
    {
        return RoleManager.Roles.CountAsync(cancellationToken);
    }
}