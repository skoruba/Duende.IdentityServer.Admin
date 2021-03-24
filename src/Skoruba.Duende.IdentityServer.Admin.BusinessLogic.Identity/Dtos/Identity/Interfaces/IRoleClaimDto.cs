// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Dtos.Identity.Interfaces
{
    public interface IRoleClaimDto : IBaseRoleClaimDto
    {
        string ClaimType { get; set; }
        string ClaimValue { get; set; }
    }
}
