// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Dtos.Users
{
    public class UserProviderApiDto<TKey>
    {
        public TKey UserId { get; set; }

        public string UserName { get; set; }

        public string ProviderKey { get; set; }

        public string LoginProvider { get; set; }

        public string ProviderDisplayName { get; set; }
    }
}







