// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Mappers
{
    public class IdentityProviderMappers
    {
        [Fact]
        public void CanMapIdentityProviderToModel()
        {
            //Generate entity
            var identityProvider = IdentityProviderMock.GenerateRandomIdentityProvider(1);

            //Try map to DTO
            var identityProviderDto = identityProvider.ToModel();

            //Assert
            identityProviderDto.Should().NotBeNull();

            identityProviderDto.Should().BeEquivalentTo(identityProvider, options =>
                options.Excluding(o => o.Properties)
                    .Excluding(o => o.NonEditable)
                    .Excluding(o => o.Created)
                    .Excluding(o => o.Updated)
                    .Excluding(o => o.LastAccessed)
            );
            //Assert collection
            identityProviderDto.Properties.Values.Should().BeEquivalentTo(System.Text.Json.JsonSerializer
                .Deserialize<Dictionary<string, string>>(identityProvider.Properties)
                .Select(x => new IdentityProviderPropertyDto { Name = x.Key, Value = x.Value }));
        }

        [Fact]
        public void CanMapIdentityProviderDtoToEntity()
        {
            //Generate DTO
            var identityProviderDto = IdentityProviderDtoMock.GenerateRandomIdentityProvider(1);

            //Try map to entity
            var identityProvider = identityProviderDto.ToEntity();

            identityProvider.Should().NotBeNull();

            identityProviderDto.Should().BeEquivalentTo(identityProvider, options =>
                options.Excluding(o => o.Properties)
                    .Excluding(o => o.NonEditable)
                    .Excluding(o => o.Created)
                    .Excluding(o => o.Updated)
                    .Excluding(o => o.LastAccessed)
                );

            //Assert collection
            identityProviderDto.Properties.Values.Should().BeEquivalentTo(System.Text.Json.JsonSerializer.Deserialize<Dictionary<string,string>>(identityProvider.Properties)
                .Select(x=>new IdentityProviderPropertyDto {Name=x.Key, Value = x.Value}));

        }
    }
}
