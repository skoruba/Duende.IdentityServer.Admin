// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Info
{
    /// <summary>
    /// Health of the system or of a single check. Owned by the API contract so the
    /// generated clients do not depend on the framework's HealthStatus enum.
    /// </summary>
    public enum SystemHealthStatus
    {
        /// <summary>
        /// Health checks are not registered by the host, or the check was not found.
        /// </summary>
        Unknown = 0,
        Healthy = 1,
        Degraded = 2,
        Unhealthy = 3
    }
}
