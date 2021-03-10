using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.ApiScopes
{
    public class ApiScopesApiDto
    {
        public ApiScopesApiDto()
        {
            Scopes = new List<ApiScopeApiDto>();
        }

        public int PageSize { get; set; }

        public int TotalCount { get; set; }

        public List<ApiScopeApiDto> Scopes { get; set; }
    }
}