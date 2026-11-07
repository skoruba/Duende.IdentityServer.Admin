// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Extensions;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.ConfigurationRules
{
    /// <summary>
    /// The rules shipped with the project, registered the way <c>AddAdminServices</c> does it.
    /// </summary>
    internal static class BuiltInRules
    {
        private static readonly IServiceProvider Provider = new ServiceCollection()
            .AddBuiltInConfigurationRules()
            .BuildServiceProvider();

        public static IConfigurationRuleRegistry Registry => Provider.GetRequiredService<IConfigurationRuleRegistry>();

        public static IConfigurationRuleValidatorFactory Factory => new ConfigurationRuleValidatorFactory(Registry, Provider);

        public static IConfigurationRuleMetadataProvider MetadataProvider => new ConfigurationRuleMetadataProvider(Registry);
    }
}
