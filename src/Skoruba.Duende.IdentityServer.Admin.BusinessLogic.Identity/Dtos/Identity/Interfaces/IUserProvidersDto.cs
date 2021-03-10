using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity.Interfaces
{
    public interface IUserProvidersDto : IUserProviderDto
    {
        List<IUserProviderDto> Providers { get; }
    }
}
