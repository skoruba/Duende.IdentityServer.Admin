// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Identity;

namespace SkorubaDuende.IdentityServerAdmin.STS.Identity.Configuration.Interfaces
{
    public interface IRootConfiguration
    {
        AdminConfiguration AdminConfiguration { get; }

        RegisterConfiguration RegisterConfiguration { get; }
    }
}







