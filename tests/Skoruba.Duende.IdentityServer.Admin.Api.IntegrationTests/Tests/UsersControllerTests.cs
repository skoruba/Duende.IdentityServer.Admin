// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Threading.Tasks;
using FluentAssertions;
using IdentityModel;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests.Base;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Middlewares;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Roles;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Users;
using Skoruba.Duende.IdentityServer.Shared.Dtos.Identity;
using Xunit;

namespace Skoruba.Duende.IdentityServer.Admin.Api.IntegrationTests.Tests
{
    public class UsersControllerTests : AdminApiTestBase
    {
        private const string UsersRolesRouteSuffix = "roles";
        private const string UsersClaimsRouteSuffix = "claims";
        private const string UsersProvidersRouteSuffix = "providers";
        private const string UsersRoleClaimsRouteSuffix = "roleclaims";
        private const string ChangePasswordRouteSegment = "changepassword";
        private const string ClaimTypeRouteSegment = "claimtype";
        private const string ClaimValueRouteSegment = "claimvalue";
        private const string RolesUsersRouteSuffix = "users";
        private const string UsersSearchParameter = "searchText";
        private const string UserClaimTypePrefix = "user_claim_type";
        private const string UserClaimValuePrefix = "user_claim_value";
        private const string RoleClaimTypePrefix = "role_claim_type";
        private const string RoleClaimValuePrefix = "role_claim_value";
        private const string UpdatedPhonePrefix = "+421";
        private const string StrongPassword = "Password123!abc";
        private const string UserIdPrefix = "user_id";
        private const int NonDefaultClaimId = 1;

        public UsersControllerTests(TestFixture fixture) : base(fixture)
        {
        }

        private void SetupAdminAuthorizationForSubject(string subjectId)
        {
            ClearAuthorization();

            using var scope = TestServer.Services.CreateScope();
            var configuration = scope.ServiceProvider.GetRequiredService<AdminApiConfiguration>();

            var claims = new[]
            {
                new Claim(JwtClaimTypes.Subject, subjectId),
                new Claim(JwtClaimTypes.Name, Guid.NewGuid().ToString()),
                new Claim(JwtClaimTypes.Role, configuration.AdministrationRole),
                new Claim(JwtClaimTypes.Scope, configuration.OidcApiName)
            };

            var token = new JwtSecurityToken(claims: claims);
            var tokenValue = new JwtSecurityTokenHandler().WriteToken(token);
            Client.DefaultRequestHeaders.Add(
                AuthenticatedTestRequestMiddleware.TestAuthorizationHeader,
                tokenValue);
        }

        private async Task<UserClaimApiDto<string>> CreateUserClaimAsync(string userId, string claimType, string claimValue)
        {
            var createClaimResponse = await Client.PostAsJsonAsync($"{UsersRoute}/{UsersClaimsRouteSuffix}", new UserClaimApiDto<string>
            {
                ClaimId = 0,
                UserId = userId,
                ClaimType = claimType,
                ClaimValue = claimValue
            });
            createClaimResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

            var userClaimsRoute = $"{ById(UsersRoute, userId)}/{UsersClaimsRouteSuffix}";
            var claimsResponse = await Client.GetAsync($"{userClaimsRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
            claimsResponse.EnsureSuccessStatusCode();

            var claims = await claimsResponse.Content.ReadFromJsonAsync<UserClaimsApiDto<string>>();
            claims.Should().NotBeNull();
            var createdClaim = claims!.Claims.Find(x => x.ClaimType == claimType && x.ClaimValue == claimValue);
            createdClaim.Should().NotBeNull();

            return createdClaim!;
        }

        [Fact]
        public async Task GetUsersAsAdmin()
        {
            SetupAdminAuthorization();

            var response = await Client.GetAsync(UsersRoute);

            response.EnsureSuccessStatusCode();
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var users = await response.Content.ReadFromJsonAsync<IdentityUsersDto>();
            users.Should().NotBeNull();
            users!.Users.Should().NotBeNull();
            users.TotalCount.Should().BeGreaterOrEqualTo(0);
        }

        [Fact]
        public async Task GetUsersWithoutPermissions()
        {
            ClearAuthorization();

            var response = await Client.GetAsync(UsersRoute);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task UserCreateWithoutPermissionsReturnsUnauthorized()
        {
            ClearAuthorization();
            var createRequest = UserCreateFaker.Generate();

            var response = await Client.PostAsJsonAsync(UsersRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetUserOptionsReturnsRequireUniqueEmail()
        {
            SetupAdminAuthorization();

            var options = await Client.GetFromJsonAsync<UserOptionsApiDto>($"{UsersRoute}/options");

            options.Should().NotBeNull();
            options!.RequireUniqueEmail.Should().BeTrue();
        }

        [Fact]
        public async Task GetUserOptionsWithoutPermissionsReturnsUnauthorized()
        {
            ClearAuthorization();

            var response = await Client.GetAsync($"{UsersRoute}/options");

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task UserCreateWithoutEmailReturnsBadRequestWhenUniqueEmailIsRequired()
        {
            SetupAdminAuthorization();
            var createRequest = UserCreateFaker.Generate();
            createRequest.Email = null;

            var response = await Client.PostAsJsonAsync(UsersRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UserCreateWithExplicitIdReturnsBadRequest()
        {
            SetupAdminAuthorization();
            var createRequest = UserCreateFaker.Generate();
            createRequest.Id = UniqueValue(UserIdPrefix);

            var response = await Client.PostAsJsonAsync(UsersRoute, createRequest);

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task GetUsersSupportsSearchByUserName()
        {
            SetupAdminAuthorization();

            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var response = await Client.GetAsync(
                    BuildSearchQuery(UsersRoute, UsersSearchParameter, createdUser.UserName));
                response.EnsureSuccessStatusCode();

                var users = await response.Content.ReadFromJsonAsync<IdentityUsersDto>();
                users.Should().NotBeNull();
                users!.Users.Should().Contain(x => x.Id == createdUserId && x.UserName == createdUser.UserName);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task GetUserByIdReturnsCreatedUser()
        {
            SetupAdminAuthorization();

            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var response = await Client.GetAsync(ById(UsersRoute, createdUserId));
                response.EnsureSuccessStatusCode();

                var user = await response.Content.ReadFromJsonAsync<IdentityUserDto>();
                user.Should().NotBeNull();
                user!.Id.Should().Be(createdUserId);
                user.UserName.Should().Be(createdUser.UserName);
                user.Email.Should().Be(createdUser.Email);
                user.PhoneNumber.Should().Be(createdUser.PhoneNumber);
                user.EmailConfirmed.Should().Be(createdUser.EmailConfirmed);
                user.PhoneNumberConfirmed.Should().Be(createdUser.PhoneNumberConfirmed);
                user.LockoutEnabled.Should().Be(createdUser.LockoutEnabled);
                user.TwoFactorEnabled.Should().Be(createdUser.TwoFactorEnabled);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task UserCreateUpdateDeleteRoundTripWorks()
        {
            SetupAdminAuthorization();

            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var detailResponse = await Client.GetAsync(ById(UsersRoute, createdUserId));
                detailResponse.EnsureSuccessStatusCode();

                var userDetail = await detailResponse.Content.ReadFromJsonAsync<IdentityUserDto>();
                userDetail.Should().NotBeNull();
                userDetail!.UserName.Should().Be(createdUser.UserName);
                userDetail.Email.Should().Be(createdUser.Email);

                var updatedEmail = $"updated_{UserCreateFaker.Generate().UserName}@example.com";
                var updatedPhone = $"{UpdatedPhonePrefix}{TestDataFaker.Random.ReplaceNumbers("#########")}";

                userDetail.Email = updatedEmail;
                userDetail.PhoneNumber = updatedPhone;
                userDetail.PhoneNumberConfirmed = true;
                userDetail.TwoFactorEnabled = true;
                userDetail.LockoutEnabled = true;

                var updateResponse = await Client.PutAsJsonAsync(UsersRoute, userDetail);
                updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var updatedResponse = await Client.GetAsync(ById(UsersRoute, createdUserId));
                updatedResponse.EnsureSuccessStatusCode();

                var updatedUser = await updatedResponse.Content.ReadFromJsonAsync<IdentityUserDto>();
                updatedUser.Should().NotBeNull();
                updatedUser!.Email.Should().Be(updatedEmail);
                updatedUser.PhoneNumber.Should().Be(updatedPhone);
                updatedUser.PhoneNumberConfirmed.Should().BeTrue();
                updatedUser.TwoFactorEnabled.Should().BeTrue();
                updatedUser.LockoutEnabled.Should().BeTrue();

                var deleteResponse = await Client.DeleteAsync(ById(UsersRoute, createdUserId));
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
                createdUserId = null;

                var getDeletedResponse = await Client.GetAsync(ById(UsersRoute, createdUser.Id));
                getDeletedResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task UserRoleAssignmentCanBeAddedAndRemoved()
        {
            SetupAdminAuthorization();

            var roleName = RoleCreateFaker.Generate().Name;
            string createdUserId = null;
            string createdRoleId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var createdRole = await CreateRoleAsync(roleName);
                createdRoleId = createdRole.Id;

                var assignRoleResponse = await Client.PostAsJsonAsync(UserRolesRoute, new UserRoleApiDto<string>
                {
                    UserId = createdUserId,
                    RoleId = createdRoleId
                });
                assignRoleResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var userRolesRoute = $"{ById(UsersRoute, createdUserId)}/{UsersRolesRouteSuffix}";
                var userRolesResponse = await Client.GetAsync($"{userRolesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                userRolesResponse.EnsureSuccessStatusCode();

                var userRoles = await userRolesResponse.Content.ReadFromJsonAsync<UserRolesApiDto<IdentityRoleDto>>();
                userRoles.Should().NotBeNull();
                userRoles!.Roles.Should().Contain(x => x.Id == createdRoleId && x.Name == roleName);

                var roleUsersRoute = $"{ById(RolesRoute, createdRoleId)}/{RolesUsersRouteSuffix}";
                var roleUsersResponse = await Client.GetAsync(
                    BuildSearchQuery(roleUsersRoute, UsersSearchParameter, createdUser.UserName, ExtendedPageSize));
                roleUsersResponse.EnsureSuccessStatusCode();

                var roleUsers = await roleUsersResponse.Content.ReadFromJsonAsync<IdentityUsersDto>();
                roleUsers.Should().NotBeNull();
                roleUsers!.Users.Should().Contain(x => x.Id == createdUserId);

                await DeleteUserRoleAsync(createdUserId, createdRoleId);

                var userRolesAfterDeleteResponse = await Client.GetAsync($"{userRolesRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                userRolesAfterDeleteResponse.EnsureSuccessStatusCode();

                var userRolesAfterDelete = await userRolesAfterDeleteResponse.Content.ReadFromJsonAsync<UserRolesApiDto<IdentityRoleDto>>();
                userRolesAfterDelete.Should().NotBeNull();
                userRolesAfterDelete!.Roles.Should().NotContain(x => x.Id == createdRoleId);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
                await SafeDeleteAsync(RolesRoute, createdRoleId);
            }
        }

        [Fact]
        public async Task UserClaimsCanBeAddedAndDeleted()
        {
            SetupAdminAuthorization();

            var claimType = UniqueValue(UserClaimTypePrefix);
            var claimValue = UniqueValue(UserClaimValuePrefix);
            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var createdClaim = await CreateUserClaimAsync(createdUserId, claimType, claimValue);

                var userClaimsRoute = $"{ById(UsersRoute, createdUserId)}/{UsersClaimsRouteSuffix}";
                var deleteClaimResponse = await Client.DeleteAsync($"{userClaimsRoute}?claimId={createdClaim!.ClaimId}");
                deleteClaimResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var claimsAfterDeleteResponse = await Client.GetAsync($"{userClaimsRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                claimsAfterDeleteResponse.EnsureSuccessStatusCode();

                var claimsAfterDelete = await claimsAfterDeleteResponse.Content.ReadFromJsonAsync<UserClaimsApiDto<string>>();
                claimsAfterDelete.Should().NotBeNull();
                claimsAfterDelete!.Claims.Should().NotContain(x => x.ClaimId == createdClaim.ClaimId);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task UserClaimsCreateWithExplicitClaimIdReturnsBadRequest()
        {
            SetupAdminAuthorization();

            var claimType = UniqueValue(UserClaimTypePrefix);
            var claimValue = UniqueValue(UserClaimValuePrefix);
            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var response = await Client.PostAsJsonAsync($"{UsersRoute}/{UsersClaimsRouteSuffix}", new UserClaimApiDto<string>
                {
                    ClaimId = NonDefaultClaimId,
                    UserId = createdUserId,
                    ClaimType = claimType,
                    ClaimValue = claimValue
                });

                response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task UserClaimsCanBeUpdated()
        {
            SetupAdminAuthorization();

            var claimType = UniqueValue(UserClaimTypePrefix);
            var claimValue = UniqueValue(UserClaimValuePrefix);
            var updatedClaimType = UniqueValue(UserClaimTypePrefix);
            var updatedClaimValue = UniqueValue(UserClaimValuePrefix);
            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var createdClaim = await CreateUserClaimAsync(createdUserId, claimType, claimValue);

                var updateClaimResponse = await Client.PutAsJsonAsync($"{UsersRoute}/{UsersClaimsRouteSuffix}", new UserClaimApiDto<string>
                {
                    ClaimId = createdClaim.ClaimId,
                    UserId = createdUserId,
                    ClaimType = updatedClaimType,
                    ClaimValue = updatedClaimValue
                });
                updateClaimResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var userClaimsRoute = $"{ById(UsersRoute, createdUserId)}/{UsersClaimsRouteSuffix}";
                var claimsResponse = await Client.GetAsync($"{userClaimsRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                claimsResponse.EnsureSuccessStatusCode();

                var claims = await claimsResponse.Content.ReadFromJsonAsync<UserClaimsApiDto<string>>();
                claims.Should().NotBeNull();
                claims!.Claims.Should().Contain(x => x.ClaimType == updatedClaimType && x.ClaimValue == updatedClaimValue);

                var updatedClaim = claims.Claims.Find(x => x.ClaimType == updatedClaimType && x.ClaimValue == updatedClaimValue);
                updatedClaim.Should().NotBeNull();

                var deleteClaimResponse = await Client.DeleteAsync($"{userClaimsRoute}?claimId={updatedClaim!.ClaimId}");
                deleteClaimResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task UserClaimsUpdateWithDefaultClaimIdReturnsBadRequest()
        {
            SetupAdminAuthorization();

            var claimType = UniqueValue(UserClaimTypePrefix);
            var claimValue = UniqueValue(UserClaimValuePrefix);
            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var response = await Client.PutAsJsonAsync($"{UsersRoute}/{UsersClaimsRouteSuffix}", new UserClaimApiDto<string>
                {
                    ClaimId = 0,
                    UserId = createdUserId,
                    ClaimType = claimType,
                    ClaimValue = claimValue
                });

                response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task UserProvidersEndpointReturnsEmptyListForNewUser()
        {
            SetupAdminAuthorization();

            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var providersResponse = await Client.GetAsync($"{ById(UsersRoute, createdUserId)}/{UsersProvidersRouteSuffix}");
                providersResponse.EnsureSuccessStatusCode();
                providersResponse.StatusCode.Should().Be(HttpStatusCode.OK);

                var providers = await providersResponse.Content.ReadFromJsonAsync<UserProvidersApiDto<string>>();
                providers.Should().NotBeNull();
                providers!.Providers.Should().NotBeNull();
                providers.Providers.Should().BeEmpty();
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task DeleteUserProviderReturnsBadRequestForUnknownProvider()
        {
            SetupAdminAuthorization();

            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var deleteProviderResponse = await DeleteBodyAsync($"{UsersRoute}/{UsersProvidersRouteSuffix}", new UserProviderDeleteApiDto<string>
                {
                    UserId = createdUserId,
                    ProviderKey = UniqueValue("provider_key"),
                    LoginProvider = UniqueValue("login_provider")
                });
                deleteProviderResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);

                var getUserResponse = await Client.GetAsync(ById(UsersRoute, createdUserId));
                getUserResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task UserChangePasswordWorksForExistingUser()
        {
            SetupAdminAuthorization();

            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var changePasswordResponse = await Client.PostAsJsonAsync($"{UsersRoute}/{ChangePasswordRouteSegment}", new UserChangePasswordApiDto<string>
                {
                    UserId = createdUserId,
                    Password = StrongPassword,
                    ConfirmPassword = StrongPassword
                });
                changePasswordResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                var getUserResponse = await Client.GetAsync(ById(UsersRoute, createdUserId));
                getUserResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task UserRoleClaimsEndpointReturnsClaimsFromAssignedRoles()
        {
            SetupAdminAuthorization();

            var roleName = RoleCreateFaker.Generate().Name;
            var claimType = UniqueValue(RoleClaimTypePrefix);
            var claimValue = UniqueValue(RoleClaimValuePrefix);
            string createdUserId = null;
            string createdRoleId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var createdRole = await CreateRoleAsync(roleName);
                createdRoleId = createdRole.Id;

                var assignRoleResponse = await Client.PostAsJsonAsync(UserRolesRoute, new UserRoleApiDto<string>
                {
                    UserId = createdUserId,
                    RoleId = createdRoleId
                });
                assignRoleResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

                await CreateRoleClaimAsync(createdRoleId, claimType, claimValue);

                var roleClaimsRoute = $"{ById(UsersRoute, createdUserId)}/{UsersRoleClaimsRouteSuffix}";
                var response = await Client.GetAsync(
                    $"{roleClaimsRoute}?claimSearchText={Uri.EscapeDataString(claimType)}&page={DefaultPage}&pageSize={ExtendedPageSize}");
                response.EnsureSuccessStatusCode();

                var roleClaims = await response.Content.ReadFromJsonAsync<RoleClaimsApiDto<string>>();
                roleClaims.Should().NotBeNull();
                roleClaims!.Claims.Should().Contain(x => x.ClaimType == claimType && x.ClaimValue == claimValue);

                await DeleteUserRoleAsync(createdUserId, createdRoleId);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
                await SafeDeleteAsync(RolesRoute, createdRoleId);
            }
        }

        [Fact]
        public async Task ClaimTypeEndpointsReturnUsersWithMatchingClaims()
        {
            SetupAdminAuthorization();

            var claimType = UniqueValue(UserClaimTypePrefix);
            var claimValue = UniqueValue(UserClaimValuePrefix);
            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                var createdClaim = await CreateUserClaimAsync(createdUserId, claimType, claimValue);

                var claimTypeAndValueRoute =
                    $"{UsersRoute}/{ClaimTypeRouteSegment}/{Uri.EscapeDataString(claimType)}/{ClaimValueRouteSegment}/{Uri.EscapeDataString(claimValue)}";
                var claimTypeAndValueResponse = await Client.GetAsync(
                    $"{claimTypeAndValueRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                claimTypeAndValueResponse.EnsureSuccessStatusCode();

                var usersWithClaimValue = await claimTypeAndValueResponse.Content.ReadFromJsonAsync<IdentityUsersDto>();
                usersWithClaimValue.Should().NotBeNull();
                usersWithClaimValue!.Users.Should().Contain(x => x.Id == createdUserId);

                var claimTypeOnlyRoute = $"{UsersRoute}/{ClaimTypeRouteSegment}/{Uri.EscapeDataString(claimType)}";
                var claimTypeOnlyResponse = await Client.GetAsync($"{claimTypeOnlyRoute}?page={DefaultPage}&pageSize={ExtendedPageSize}");
                claimTypeOnlyResponse.EnsureSuccessStatusCode();

                var usersWithClaimType = await claimTypeOnlyResponse.Content.ReadFromJsonAsync<IdentityUsersDto>();
                usersWithClaimType.Should().NotBeNull();
                usersWithClaimType!.Users.Should().Contain(x => x.Id == createdUserId);

                var deleteClaimResponse = await Client.DeleteAsync($"{ById(UsersRoute, createdUserId)}/{UsersClaimsRouteSuffix}?claimId={createdClaim.ClaimId}");
                deleteClaimResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }

        [Fact]
        public async Task DeleteCurrentSubjectUserIsForbidden()
        {
            SetupAdminAuthorization();

            string createdUserId = null;

            try
            {
                var createdUser = await CreateUserAsync();
                createdUserId = createdUser.Id;

                SetupAdminAuthorizationForSubject(createdUserId);
                var deleteResponse = await Client.DeleteAsync(ById(UsersRoute, createdUserId));
                deleteResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

                SetupAdminAuthorization();
                var stillExistsResponse = await Client.GetAsync(ById(UsersRoute, createdUserId));
                stillExistsResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            }
            finally
            {
                SetupAdminAuthorization();
                await SafeDeleteAsync(UsersRoute, createdUserId);
            }
        }
    }
}
