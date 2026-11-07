// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Common;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Users;
using Skoruba.Duende.IdentityServer.Shared.Dtos.Identity;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class OptionalEmailTestFixture : TestFixture
    {
        public OptionalEmailTestFixture() : base(new Dictionary<string, string>
        {
            ["IdentityOptions:User:RequireUniqueEmail"] = "false"
        })
        {
        }
    }

    public class UsersWithoutEmailTests : IClassFixture<OptionalEmailTestFixture>
    {
        private const string UsersRoute = "api/users";

        private readonly HttpClient _client;
        private readonly TestServer _testServer;

        public UsersWithoutEmailTests(OptionalEmailTestFixture fixture)
        {
            _client = fixture.Client;
            _testServer = fixture.TestServer;
        }

        private void SetupAdminAuthorization()
        {
            _client.DefaultRequestHeaders.Clear();

            using var scope = _testServer.Services.CreateScope();
            var configuration = scope.ServiceProvider.GetRequiredService<AdminApiConfiguration>();
            _client.SetAdminClaimsViaHeaders(configuration);
        }

        [Fact]
        public async Task GetUserOptionsReturnsEmailAsOptional()
        {
            SetupAdminAuthorization();

            var options = await _client.GetFromJsonAsync<UserOptionsApiDto>($"{UsersRoute}/options");

            options.Should().NotBeNull();
            options!.RequireUniqueEmail.Should().BeFalse();
        }

        [Fact]
        public async Task UserWithoutEmailCanBeCreatedListedAndUpdated()
        {
            SetupAdminAuthorization();
            var userName = $"user_without_email_{System.Guid.NewGuid():N}";
            string userId = null;

            try
            {
                var createResponse = await _client.PostAsJsonAsync(UsersRoute, new IdentityUserDto { UserName = userName });
                createResponse.StatusCode.Should().Be(HttpStatusCode.Created);

                var created = await createResponse.Content.ReadFromJsonAsync<IdentityUserDto>();
                created.Should().NotBeNull();
                created!.Email.Should().BeNull();
                userId = created.Id;

                var listResponse = await _client.GetAsync($"{UsersRoute}?searchText={userName}");
                listResponse.StatusCode.Should().Be(HttpStatusCode.OK);
                var users = await listResponse.Content.ReadFromJsonAsync<IdentityUsersDto>();
                users!.Users.Should().ContainSingle(x => x.Id == userId && x.Email == null);

                created.PhoneNumber = "+420123456789";
                var updateResponse = await _client.PutAsJsonAsync(UsersRoute, created);
                updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var detail = await _client.GetFromJsonAsync<IdentityUserDto>($"{UsersRoute}/{userId}");
                detail!.Email.Should().BeNull();
                detail.PhoneNumber.Should().Be("+420123456789");
            }
            finally
            {
                if (userId != null)
                {
                    await _client.DeleteAsync($"{UsersRoute}/{userId}");
                }
            }
        }
    }
}
