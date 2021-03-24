// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration.Identity;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration.IdentityServer
{
    public class Client : global::Duende.IdentityServer.Models.Client
    {
        public List<Claim> ClientClaims { get; set; } = new List<Claim>();
    }
}
