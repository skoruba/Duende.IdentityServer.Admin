// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Info
{
    public class SystemHealthApiDto
    {
        /// <summary>
        /// Overall status of all registered health checks.
        /// </summary>
        public SystemHealthStatus Status { get; set; }

        /// <summary>
        /// Status of the OpenID Connect discovery check against the IdentityServer instance.
        /// </summary>
        public SystemHealthStatus IdentityServerStatus { get; set; }

        public List<SystemHealthEntryApiDto> Entries { get; set; } = new();
    }
}
