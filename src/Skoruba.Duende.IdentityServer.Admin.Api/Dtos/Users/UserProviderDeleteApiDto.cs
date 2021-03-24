// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Users
{
    public class UserProviderDeleteApiDto<TKey>
    {
        public TKey UserId { get; set; }

        public string ProviderKey { get; set; }

        public string LoginProvider { get; set; }
    }
}