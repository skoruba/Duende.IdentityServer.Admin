using System.Threading;
using System.Threading.Tasks;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.DashboardIdentity;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Identity.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Services;

public class DashboardIdentityService : IDashboardIdentityService
{
    protected readonly IDashboardIdentityRepository DashboardIdentityRepository;

    public DashboardIdentityService(IDashboardIdentityRepository dashboardIdentityRepository)
    {
        DashboardIdentityRepository = dashboardIdentityRepository;
    }   
    
    public async Task<DashboardIdentityDto> GetIdentityDashboardAsync(CancellationToken cancellationToken = default)
    {
        return new DashboardIdentityDto
        {
            RolesTotal = await DashboardIdentityRepository.GetRolesTotalCountAsync(cancellationToken),
            UsersTotal = await DashboardIdentityRepository.GetUsersTotalCountAsync(cancellationToken)
        };
    }
}