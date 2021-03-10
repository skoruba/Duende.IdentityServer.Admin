using System.Collections.Generic;
using System.Linq;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity
{
    public class RoleClaimsDto<TRoleClaimDto, TKey> : RoleClaimDto<TKey>, IRoleClaimsDto
        where TRoleClaimDto : RoleClaimDto<TKey>
    {
        public RoleClaimsDto()
        {
            Claims = new List<TRoleClaimDto>();
        }

        public string RoleName { get; set; }

        public List<TRoleClaimDto> Claims { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }

        List<IRoleClaimDto> IRoleClaimsDto.Claims => Claims.Cast<IRoleClaimDto>().ToList();
    }
}
