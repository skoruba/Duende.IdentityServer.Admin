using System.Threading;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.DashboardIdentity;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Services.Interfaces;

public interface IDashboardIdentityService
{
    public Task<DashboardIdentityDto> GetIdentityDashboardAsync(CancellationToken cancellationToken = default);
}