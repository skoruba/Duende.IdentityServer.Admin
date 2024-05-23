// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.Configuration.Schema
{
    public class AdminIdentityDbSchemaConfiguration
    {
        public string IdentityRoles { get; set; } = "Roles";
        public string IdentityRoleClaims { get; set; } = "RoleClaims";
        public string IdentityUserRoles { get; set; } = "UserRoles";
        public string IdentityUsers { get; set; } = "Users";
        public string IdentityUserLogins { get; set; } = "UserLogins";
        public string IdentityUserClaims { get; set; } = "UserClaims";
        public string IdentityUserTokens { get; set; } = "UserTokens";
    }
}







