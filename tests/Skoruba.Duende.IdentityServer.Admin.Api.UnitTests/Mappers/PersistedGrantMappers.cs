using System;
using FluentAssertions;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.PersistedGrants;
using Skoruba.Duende.IdentityServer.Admin.Api.Mappers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Grant;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mappers
{
    public class PersistedGrantMappers
    {
        [Fact]
        public void CanMapPersistedGrantDtoToPersistedGrantSubjectsApiDto()
        {
            var persistedGrantDto = PersistedGrantDtoMock.GenerateRandomPersistedGrant(Guid.NewGuid().ToString(), Guid.NewGuid().ToString());

            var persistedGrantsDto = new PersistedGrantsDto();
            
            persistedGrantsDto.PersistedGrants.Add(persistedGrantDto);

            var persistedGrantSubjectsApiDto = persistedGrantsDto.ToPersistedGrantApiModel<PersistedGrantSubjectsApiDto>();

            persistedGrantSubjectsApiDto.Should().BeEquivalentTo(persistedGrantsDto, options => options.Excluding(x=> x.SubjectId));
        }

        [Fact]
        public void CanMapPersistedGrantDtoToPersistedGrantsApiDto()
        {
            var persistedGrantDto = PersistedGrantDtoMock.GenerateRandomPersistedGrant(Guid.NewGuid().ToString(), Guid.NewGuid().ToString());

            var persistedGrantsDto = new PersistedGrantsDto();

            persistedGrantsDto.PersistedGrants.Add(persistedGrantDto);

            var persistedGrantsApiDto = persistedGrantsDto.ToPersistedGrantApiModel<PersistedGrantsApiDto>();

            persistedGrantsApiDto.Should().BeEquivalentTo(persistedGrantsDto, options => options.Excluding(x => x.SubjectId));
        }

        [Fact]
        public void CanMapPersistedGrantDtoToPersistedGrantApiDto()
        {
            var persistedGrantDto = PersistedGrantDtoMock.GenerateRandomPersistedGrant(Guid.NewGuid().ToString(), Guid.NewGuid().ToString());

            var persistedGrantApiDto = persistedGrantDto.ToPersistedGrantApiModel<PersistedGrantApiDto>();

            persistedGrantApiDto.Should().BeEquivalentTo(persistedGrantDto, options => options.Excluding(x => x.SubjectId));
        }
    }
}