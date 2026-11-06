// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.Api.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class CustomConfigurationRulesTests : BaseClassFixture
    {
        public CustomConfigurationRulesTests(TestFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public void ApiHostRegistersTheRulesOfItsProjectNextToTheBuiltInOnes()
        {
            var key = new ClientSecretMustExpireWithinOneYearRule().Key;

            var registry = TestServer.Services.GetRequiredService<IConfigurationRuleRegistry>();
            var metadata = TestServer.Services.GetRequiredService<IConfigurationRuleMetadataProvider>().GetMetadata(key);

            registry.Find(key).IsBuiltIn.Should().BeFalse();
            registry.Rules.Should().HaveCount(ConfigurationRuleKeys.BuiltIn.Count + 1);
            metadata.DisplayName.Should().Be("Client Secret Must Expire Within One Year");
        }
    }
}
