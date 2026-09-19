// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Text.Json;
using FluentAssertions;
using Skoruba.AuditLogging.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.UnitTests.Mocks;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.UnitTests.Mappers
{
    public class LogMappers
    {
        [Fact]
        public void CanMapIdentityResourceToModel()
        {
            //Generate entity
            var log = LogMock.GenerateRandomLog(1);

            //Try map to DTO
            var logDto = log.ToModel();

            //Asert
            logDto.Should().NotBeNull();

            logDto.Should().BeEquivalentTo(log, options =>
                options.Excluding(o => o.PropertiesXml));
        }

        [Fact]
        public void CanMapIdentityResourceDtoToEntity()
        {
            //Generate DTO
            var logDto = LogDtoMock.GenerateRandomLog(1);

            //Try map to entity
            var log = logDto.ToEntity();

            log.Should().NotBeNull();

            logDto.Should().BeEquivalentTo(log, options =>
                options.Excluding(o => o.PropertiesXml));
        }

        [Fact]
        public void AuditLogCreated_IsSerializedWithTheServerOffset()
        {
            // The audit library stores DateTime.Now and the database returns it without a kind
            var auditLog = new AuditLog { Id = 1, Created = new DateTime(2026, 9, 19, 8, 30, 0, DateTimeKind.Unspecified) };

            var auditLogDto = auditLog.ToModel();

            auditLogDto.Created.Should().Be(auditLog.Created);
            auditLogDto.Created.Kind.Should().Be(DateTimeKind.Local);

            // Without an offset the browser would read the value in its own time zone
            var offset = TimeZoneInfo.Local.GetUtcOffset(auditLog.Created);
            var expectedSuffix = (offset < TimeSpan.Zero ? "-" : "+") + offset.ToString(@"hh\:mm");
            JsonSerializer.Serialize(auditLogDto.Created).Should().Be($"\"2026-09-19T08:30:00{expectedSuffix}\"");
        }
    }
}
