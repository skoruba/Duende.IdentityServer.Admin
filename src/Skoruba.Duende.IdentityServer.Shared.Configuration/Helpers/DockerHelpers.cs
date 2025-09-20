﻿// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Microsoft.Extensions.Configuration;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Common;

namespace Skoruba.Duende.IdentityServer.Shared.Configuration.Helpers
{
    public static class DockerHelpers
    {
        private static void UpdateCaCertificates()
        {
            "update-ca-certificates".Bash();
        }

        public static void ApplyDockerConfiguration(this IConfiguration configuration)
        {
            var dockerConfiguration = configuration.GetSection(nameof(DockerConfiguration)).Get<DockerConfiguration>();

            if (dockerConfiguration is { UpdateCaCertificate: true })
            {
                UpdateCaCertificates();
            }
        }
    }
}