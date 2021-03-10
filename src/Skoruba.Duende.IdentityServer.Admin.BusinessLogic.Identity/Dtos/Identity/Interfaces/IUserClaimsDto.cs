using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity.Interfaces
{
    public interface IUserClaimsDto : IUserClaimDto
    {
        string UserName { get; set; }
        List<IUserClaimDto> Claims { get; }
        int TotalCount { get; set; }
        int PageSize { get; set; }
    }
}
