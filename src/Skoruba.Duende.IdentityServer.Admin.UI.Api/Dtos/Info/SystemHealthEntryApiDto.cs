// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Info
{
    public class SystemHealthEntryApiDto
    {
        public string Name { get; set; }

        public SystemHealthStatus Status { get; set; }
    }
}
