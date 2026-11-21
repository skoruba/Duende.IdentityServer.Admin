// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class ConfigurationRuleRegistrationTests : BaseClassFixture
    {
        public ConfigurationRuleRegistrationTests(TestFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public void ApiHostRegistersTheBuiltInRules()
        {
            var registry = TestServer.Services.GetRequiredService<IConfigurationRuleRegistry>();

            registry.Rules.Select(x => x.Key).Should().BeEquivalentTo(ConfigurationRuleKeys.BuiltIn);
            registry.Rules.Should().OnlyContain(x => x.IsBuiltIn);
        }
    }
}
