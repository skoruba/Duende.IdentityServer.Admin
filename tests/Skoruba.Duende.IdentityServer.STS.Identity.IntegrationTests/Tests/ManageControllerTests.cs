// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.Entities.Identity;
using Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Common;
using Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Mocks;
using Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Tests.Base;
using Xunit;

namespace Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Tests
{
    public class ManageControllerTests : BaseClassFixture
    {
        private const string ForgetTwoFactorClientAction = "/Manage/ForgetTwoFactorClient";

        public ManageControllerTests(TestFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task AuthorizeUserCanAccessManageViews()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();
            var registerResponse = await UserMocks.RegisterNewUserAsync(Client,registerFormData);

            // Get cookie with user identity for next request
            Client.PutCookiesOnRequest(registerResponse);
            
            foreach (var route in RoutesConstants.GetManageRoutes())
            {
                // Act
                var response = await Client.GetAsync($"/Manage/{route}");

                // Assert
                response.EnsureSuccessStatusCode();
                response.StatusCode.Should().Be(HttpStatusCode.OK);
            }
        }

        [Fact]
        public async Task UnAuthorizeUserCannotAccessManageViews()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            foreach (var route in RoutesConstants.GetManageRoutes())
            {
                // Act
                var response = await Client.GetAsync($"/Manage/{route}");

                // Assert      
                response.StatusCode.Should().Be(HttpStatusCode.Redirect);

                //The redirect to login
                response.Headers.Location.ToString().Should().Contain("Account/Login");
            }
        }
        
        [Fact]
        public async Task UserIsAbleToUpdateProfile()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();
            var registerResponse = await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // Get cookie with user identity for next request
            Client.PutCookiesOnRequest(registerResponse);

            // Prepare request to update profile
            const string manageAction = "/Manage/Index";
            var manageResponse = await Client.GetAsync(manageAction);
            var antiForgeryToken = await manageResponse.ExtractAntiForgeryToken();

            var manageProfileData = UserMocks.GenerateManageProfileData(registerFormData["Email"], antiForgeryToken);

            // Update profile
            var requestWithAntiForgeryCookie = RequestHelper.CreatePostRequestWithCookies(manageAction, manageProfileData, manageResponse);
            var requestWithIdentityCookie = CookiesHelper.CopyCookiesFromResponse(requestWithAntiForgeryCookie, registerResponse);
            var responseMessage = await Client.SendAsync(requestWithIdentityCookie);

            // Assert      
            responseMessage.StatusCode.Should().Be(HttpStatusCode.Redirect);

            //The redirect to login
            responseMessage.Headers.Location.ToString().Should().Be("/Manage");
        }

        [Fact]
        public async Task UserIsRedirectedBackToPasskeysWhenNoPasskeyCredentialIsPosted()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();
            var registerResponse = await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // Get cookie with user identity for next request
            Client.PutCookiesOnRequest(registerResponse);

            // Prepare request to add passkey
            const string passkeysAction = "/Manage/Passkeys";
            const string addPasskeyAction = "/Manage/AddPasskey";
            var passkeysResponse = await Client.GetAsync(passkeysAction);
            var antiForgeryToken = await passkeysResponse.ExtractAntiForgeryToken();

            var addPasskeyData = new Dictionary<string, string>
            {
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Add passkey without credential payload
            var requestWithAntiForgeryCookie = RequestHelper.CreatePostRequestWithCookies(addPasskeyAction, addPasskeyData, passkeysResponse);
            var requestWithIdentityCookie = CookiesHelper.CopyCookiesFromResponse(requestWithAntiForgeryCookie, registerResponse);
            var responseMessage = await Client.SendAsync(requestWithIdentityCookie);

            // Assert
            responseMessage.StatusCode.Should().Be(HttpStatusCode.Redirect);
            responseMessage.Headers.Location.ToString().Should().Be(passkeysAction);
        }

        [Fact]
        public async Task UserIsRedirectedBackToPasskeysWhenPasskeyClientErrorIsPosted()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();
            var registerResponse = await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // Get cookie with user identity for next request
            Client.PutCookiesOnRequest(registerResponse);

            // Prepare request to add passkey with simulated client-side error
            const string passkeysAction = "/Manage/Passkeys";
            const string addPasskeyAction = "/Manage/AddPasskey";
            var passkeysResponse = await Client.GetAsync(passkeysAction);
            var antiForgeryToken = await passkeysResponse.ExtractAntiForgeryToken();

            var addPasskeyData = new Dictionary<string, string>
            {
                { "Passkey.Error", "No passkey was provided by the authenticator." },
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Add passkey with simulated passkey error
            var requestWithAntiForgeryCookie = RequestHelper.CreatePostRequestWithCookies(addPasskeyAction, addPasskeyData, passkeysResponse);
            var requestWithIdentityCookie = CookiesHelper.CopyCookiesFromResponse(requestWithAntiForgeryCookie, registerResponse);
            var responseMessage = await Client.SendAsync(requestWithIdentityCookie);

            // Assert
            responseMessage.StatusCode.Should().Be(HttpStatusCode.Redirect);
            responseMessage.Headers.Location.ToString().Should().Be(passkeysAction);
        }

        [Fact]
        public async Task UserIsRedirectedToPasskeysWhenRenamePasskeyIdIsInvalid()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();
            var registerResponse = await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // Get cookie with user identity for next request
            Client.PutCookiesOnRequest(registerResponse);

            // Invalid base64url id should redirect back to passkeys
            var response = await Client.GetAsync("/Manage/RenamePasskey?id=not-a-valid-id");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Redirect);
            response.Headers.Location.ToString().Should().Be("/Manage/Passkeys");
        }

        [Fact]
        public async Task ForgetTwoFactorClientIsRejectedWithoutAntiForgeryToken()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();
            var registerResponse = await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // The user is signed in, so it is the anti-forgery validation that answers - not the redirect to login
            var request = CookiesHelper.CopyCookiesFromResponse(
                new HttpRequestMessage(HttpMethod.Post, ForgetTwoFactorClientAction)
                {
                    Content = new FormUrlEncodedContent(new Dictionary<string, string>())
                },
                registerResponse);

            var response = await Client.SendAsync(request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UserIsAbleToForgetTwoFactorClient()
        {
            Client.DefaultRequestHeaders.Clear();

            // A user with an authenticator app
            var registerFormData = UserMocks.GenerateRegisterData();
            await UserMocks.RegisterNewUserAsync(Client, registerFormData);
            Client.DefaultRequestHeaders.Clear();

            string authenticatorKey;
            using (var scope = TestServer.Services.CreateScope())
            {
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<UserIdentity>>();
                var user = await userManager.FindByNameAsync(registerFormData["UserName"]);

                await userManager.ResetAuthenticatorKeyAsync(user);
                await userManager.SetTwoFactorEnabledAsync(user, true);
                authenticatorKey = await userManager.GetAuthenticatorKeyAsync(user);
            }

            // The password alone ends on the second factor
            const string accountLoginAction = "/Account/Login";
            var loginPage = await Client.GetAsync(accountLoginAction);
            var loginDataForm = UserMocks.GenerateLoginData(registerFormData["UserName"], registerFormData["Password"],
                await loginPage.ExtractAntiForgeryToken());

            var loginResponse = await Client.SendAsync(
                RequestHelper.CreatePostRequestWithCookies(accountLoginAction, loginDataForm, loginPage));

            loginResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);
            loginResponse.Headers.Location.ToString().Should().StartWith("/Account/LoginWith2fa");

            var cookies = CookiesHelper.ExtractCookiesFromResponse(loginPage);
            ApplyCookies(cookies, loginResponse);

            // The authenticator code signs the user in and the browser is remembered
            const string twoFactorAction = "/Account/LoginWith2fa";
            var twoFactorPage = await Client.SendAsync(
                CookiesHelper.PutCookiesOnRequest(new HttpRequestMessage(HttpMethod.Get, twoFactorAction), cookies));
            twoFactorPage.StatusCode.Should().Be(HttpStatusCode.OK);
            ApplyCookies(cookies, twoFactorPage);

            var twoFactorRequest = new HttpRequestMessage(HttpMethod.Post, twoFactorAction)
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["TwoFactorCode"] = TotpHelper.ComputeCode(authenticatorKey),
                    ["RememberMachine"] = "true",
                    [UserMocks.AntiForgeryTokenKey] = await twoFactorPage.ExtractAntiForgeryToken()
                })
            };

            var twoFactorResponse = await Client.SendAsync(CookiesHelper.PutCookiesOnRequest(twoFactorRequest, cookies));

            twoFactorResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);
            ApplyCookies(cookies, twoFactorResponse);
            cookies.Should().ContainKey(IdentityConstants.TwoFactorRememberMeScheme);

            // The forget browser form has to carry the anti-forgery token its POST action validates
            const string twoFactorAuthenticationAction = "/Manage/TwoFactorAuthentication";
            var managePage = await Client.SendAsync(
                CookiesHelper.PutCookiesOnRequest(new HttpRequestMessage(HttpMethod.Get, twoFactorAuthenticationAction), cookies));
            managePage.StatusCode.Should().Be(HttpStatusCode.OK);
            ApplyCookies(cookies, managePage);

            var forgetBrowserForm = await FindForgetBrowserFormAsync(managePage);
            forgetBrowserForm.Should().NotBeNull();

            var antiForgeryToken = AntiForgeryHelper.ExtractAntiForgeryToken(forgetBrowserForm);
            antiForgeryToken.Should().NotBeNullOrEmpty();

            var forgetRequest = new HttpRequestMessage(HttpMethod.Post, ForgetTwoFactorClientAction)
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    [UserMocks.AntiForgeryTokenKey] = antiForgeryToken
                })
            };

            var forgetResponse = await Client.SendAsync(CookiesHelper.PutCookiesOnRequest(forgetRequest, cookies));

            // Assert
            forgetResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);
            forgetResponse.Headers.Location.ToString().Should().Be(twoFactorAuthenticationAction);

            ApplyCookies(cookies, forgetResponse);
            cookies.Should().NotContainKey(IdentityConstants.TwoFactorRememberMeScheme);

            // The browser is no longer remembered, so there is nothing left to forget
            var managePageAfterwards = await Client.SendAsync(
                CookiesHelper.PutCookiesOnRequest(new HttpRequestMessage(HttpMethod.Get, twoFactorAuthenticationAction), cookies));
            managePageAfterwards.StatusCode.Should().Be(HttpStatusCode.OK);

            (await FindForgetBrowserFormAsync(managePageAfterwards)).Should().BeNull();
        }

        /// <summary>
        /// What a browser does with Set-Cookie: it keeps the new value and drops a cookie the server deleted.
        /// </summary>
        private static void ApplyCookies(IDictionary<string, string> cookies, HttpResponseMessage response)
        {
            foreach (var cookie in CookiesHelper.ExtractCookiesFromResponse(response))
            {
                if (string.IsNullOrEmpty(cookie.Value))
                {
                    cookies.Remove(cookie.Key);
                }
                else
                {
                    cookies[cookie.Key] = cookie.Value;
                }
            }
        }

        /// <summary>
        /// The content of the form offering to forget the browser, or null when the page does not render it.
        /// </summary>
        private static async Task<string> FindForgetBrowserFormAsync(HttpResponseMessage response)
        {
            var html = await response.Content.ReadAsStringAsync();
            var match = Regex.Match(html, @"<form[^>]*ForgetTwoFactorClient[^>]*>(.*?)</form>", RegexOptions.Singleline);

            return match.Success ? match.Groups[1].Value : null;
        }
    }
}
