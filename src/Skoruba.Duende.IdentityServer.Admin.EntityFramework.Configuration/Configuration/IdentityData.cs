// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration.Identity;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration
{
	public class IdentityData
    {
       public List<Role> Roles { get; set; }
       public List<User> Users { get; set; }
    }
}
