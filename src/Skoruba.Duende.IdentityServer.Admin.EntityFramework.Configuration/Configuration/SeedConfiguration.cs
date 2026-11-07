// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration
{
    public class SeedConfiguration
    {
        public bool ApplySeed { get; set; } = false;

        /// <summary>
        /// Creates a disabled row for every registered configuration rule that has none yet,
        /// so that rules added in code exist in every environment without a migration.
        /// </summary>
        public bool ApplyConfigurationRulesSeed { get; set; } = false;
    }
}