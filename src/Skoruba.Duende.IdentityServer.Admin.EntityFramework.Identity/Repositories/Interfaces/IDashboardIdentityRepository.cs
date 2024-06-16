using System.Threading;
using System.Threading.Tasks;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.Repositories.Interfaces;

public interface IDashboardIdentityRepository
{
    public Task<int> GetUsersTotalCountAsync(CancellationToken cancellationToken = default);
    
    public Task<int> GetRolesTotalCountAsync(CancellationToken cancellationToken = default);
}