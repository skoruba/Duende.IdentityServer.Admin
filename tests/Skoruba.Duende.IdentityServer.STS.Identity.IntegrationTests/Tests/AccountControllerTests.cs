// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.Entities.Identity;
using Skoruba.Duende.IdentityServer.STS.Identity.Configuration;
using Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Common;
using Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Mocks;
using Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Tests.Base;
using Xunit;

namespace Skoruba.Duende.IdentityServer.STS.Identity.IntegrationTests.Tests
{
    public class AccountControllerTests : BaseClassFixture
    {
        public AccountControllerTests(TestFixture fixture) : base(fixture)
        {
        }

        [Fact]
        public async Task UserIsAbleToRegister()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();
            var registerResponse = await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // Assert      
            registerResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);

            //The redirect to login
            registerResponse.Headers.Location.ToString().Should().Be("/");
        }

        [Fact]
        public async Task RecoveryCodeLoginIsRejectedWithoutAntiForgeryToken()
        {
            Client.DefaultRequestHeaders.Clear();

            var response = await Client.PostAsync("/Account/LoginWithRecoveryCode", new FormUrlEncodedContent(
                new Dictionary<string, string> { ["RecoveryCode"] = "12345678" }));

            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task UserIsAbleToLoginWithRecoveryCode()
        {
            Client.DefaultRequestHeaders.Clear();

            // A user with two-factor authentication and one recovery code
            var registerFormData = UserMocks.GenerateRegisterData();
            await UserMocks.RegisterNewUserAsync(Client, registerFormData);
            Client.DefaultRequestHeaders.Clear();

            string recoveryCode;
            using (var scope = TestServer.Services.CreateScope())
            {
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<UserIdentity>>();
                var user = await userManager.FindByNameAsync(registerFormData["UserName"]);

                await userManager.ResetAuthenticatorKeyAsync(user);
                await userManager.SetTwoFactorEnabledAsync(user, true);
                recoveryCode = (await userManager.GenerateNewTwoFactorRecoveryCodesAsync(user, 1)).Single();
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

            // The recovery code form has to carry the anti-forgery token its POST action validates
            const string recoveryCodeAction = "/Account/LoginWithRecoveryCode";
            var cookies = CookiesHelper.ExtractCookiesFromResponse(loginPage);
            foreach (var cookie in CookiesHelper.ExtractCookiesFromResponse(loginResponse))
            {
                cookies[cookie.Key] = cookie.Value;
            }

            var recoveryPage = await Client.SendAsync(
                CookiesHelper.PutCookiesOnRequest(new HttpRequestMessage(HttpMethod.Get, recoveryCodeAction), cookies));
            recoveryPage.StatusCode.Should().Be(HttpStatusCode.OK);

            var antiForgeryToken = await recoveryPage.ExtractAntiForgeryToken();
            antiForgeryToken.Should().NotBeNullOrEmpty();

            foreach (var cookie in CookiesHelper.ExtractCookiesFromResponse(recoveryPage))
            {
                cookies[cookie.Key] = cookie.Value;
            }

            var recoveryRequest = new HttpRequestMessage(HttpMethod.Post, recoveryCodeAction)
            {
                Content = new FormUrlEncodedContent(new Dictionary<string, string>
                {
                    ["RecoveryCode"] = recoveryCode,
                    [UserMocks.AntiForgeryTokenKey] = antiForgeryToken
                })
            };

            var recoveryResponse = await Client.SendAsync(CookiesHelper.PutCookiesOnRequest(recoveryRequest, cookies));

            recoveryResponse.StatusCode.Should().Be(HttpStatusCode.Redirect);
            recoveryResponse.Headers.Location.ToString().Should().Be("/");
            CookiesHelper.ExistsCookie(recoveryResponse, ".AspNetCore.Identity.Application").Should().BeTrue();
        }

        [Fact]
        public async Task UserIsNotAbleToRegisterWithSameUserName()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();

            var registerResponseFirst = await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // Assert      
            registerResponseFirst.StatusCode.Should().Be(HttpStatusCode.Redirect);

            //The redirect to login
            registerResponseFirst.Headers.Location.ToString().Should().Be("/");

            var registerResponseSecond = await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // Assert response
            registerResponseSecond.StatusCode.Should().Be(HttpStatusCode.OK);

            // Get html content
            var contentWithErrorMessage = await registerResponseSecond.Content.ReadAsStringAsync();

            // From String
            var doc = new HtmlDocument();
            doc.LoadHtml(contentWithErrorMessage);

            // Get error messages from validation summary
            var errorNodes = doc.DocumentNode
                .SelectNodes("//div[contains(@class, 'validation-summary-errors')]/ul/li");

            errorNodes.Should().HaveCount(2);

            // Build expected error messages
            var expectedErrorMessages = new List<string>
            {
                $"Username &#x27;{registerFormData["UserName"]}&#x27; is already taken.",
                $"Email &#x27;{registerFormData["Email"]}&#x27; is already taken."
            };

            // Assert
            var containErrors = errorNodes.Select(x => x.InnerText).ToList().SequenceEqual(expectedErrorMessages);

            containErrors.Should().BeTrue();
        }

        [Fact]
        public async Task UserIsAbleToLogin()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();
            await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            const string accountLoginAction = "/Account/Login";
            var loginResponse = await Client.GetAsync(accountLoginAction);
            var antiForgeryToken = await loginResponse.ExtractAntiForgeryToken();

            var loginDataForm = UserMocks.GenerateLoginData(registerFormData["UserName"], registerFormData["Password"],
                antiForgeryToken);

            // Login
            var requestMessage = RequestHelper.CreatePostRequestWithCookies(accountLoginAction, loginDataForm, loginResponse);
            var responseMessage = await Client.SendAsync(requestMessage);

            // Assert status code    
            responseMessage.StatusCode.Should().Be(HttpStatusCode.Redirect);

            // Assert redirect location
            responseMessage.Headers.Location.ToString().Should().Be("/");

            // Check if response contain cookie with Identity
            const string identityCookieName = ".AspNetCore.Identity.Application";
            var existsCookie = CookiesHelper.ExistsCookie(responseMessage, identityCookieName);

            // Assert Identity cookie
            existsCookie.Should().BeTrue();
        }

        [Fact]
        public async Task UserIsNotAbleToLoginWithIncorrectPassword()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Register new user
            var registerFormData = UserMocks.GenerateRegisterData();
            await UserMocks.RegisterNewUserAsync(Client, registerFormData);

            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            const string accountLoginAction = "/Account/Login";
            var loginResponse = await Client.GetAsync(accountLoginAction);
            var antiForgeryToken = await loginResponse.ExtractAntiForgeryToken();

            // User Guid like fake password
            var loginDataForm = UserMocks.GenerateLoginData(registerFormData["UserName"], Guid.NewGuid().ToString(), antiForgeryToken);

            // Login
            var requestMessage = RequestHelper.CreatePostRequestWithCookies(accountLoginAction, loginDataForm, loginResponse);
            var responseMessage = await Client.SendAsync(requestMessage);

            // Get html content
            var contentWithErrorMessage = await responseMessage.Content.ReadAsStringAsync();

            // Assert status code    
            responseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

            // From String
            var doc = new HtmlDocument();
            doc.LoadHtml(contentWithErrorMessage);

            // Get error messages from validation summary
            var errorNodes = doc.DocumentNode
                .SelectNodes("//div[contains(@class, 'validation-summary-errors')]/ul/li");

            errorNodes.Should().HaveCount(1);

            // Build expected error messages
            var expectedErrorMessages = new List<string>
            {
                "Invalid username or password"
            };

            // Assert
            var containErrors = errorNodes.Select(x => x.InnerText).ToList().SequenceEqual(expectedErrorMessages);

            containErrors.Should().BeTrue();

            // Check if response contain cookie with Identity
            const string identityCookieName = ".AspNetCore.Identity.Application";
            var existsCookie = CookiesHelper.ExistsCookie(responseMessage, identityCookieName);

            // Assert Identity cookie
            existsCookie.Should().BeFalse();
        }

        [Fact]
        public async Task PasskeySubmitCancelDoesNotValidateUsernameAndPassword()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            var (loginResponse, antiForgeryToken) = await GetLoginPageAsync();

            var loginDataForm = new Dictionary<string, string>
            {
                { "__passkeySubmit", string.Empty },
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Submit passkey action without credential payload (equivalent to passkey picker cancel)
            var responseMessage = await PostLoginAsync(loginDataForm, loginResponse);

            // Assert status code
            responseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

            // Assert no validation/credential errors are shown
            (await GetValidationSummaryErrorsAsync(responseMessage)).Should().BeEmpty();
        }

        [Fact]
        public async Task PasskeyErrorPayloadWithoutSubmitButtonDoesNotValidateUsernameAndPassword()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            var (loginResponse, antiForgeryToken) = await GetLoginPageAsync();

            var loginDataForm = new Dictionary<string, string>
            {
                { "Passkey.Error", "No passkey was provided by the authenticator." },
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Submit passkey-style payload without submitter marker
            var responseMessage = await PostLoginAsync(loginDataForm, loginResponse);

            // Assert status code
            responseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

            // Assert no validation/credential errors are shown
            (await GetValidationSummaryErrorsAsync(responseMessage)).Should().BeEmpty();
        }

        [Fact]
        public async Task PasskeySubmitButtonValueWithoutHiddenMarkerDoesNotValidateUsernameAndPassword()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            var (loginResponse, antiForgeryToken) = await GetLoginPageAsync();

            var loginDataForm = new Dictionary<string, string>
            {
                { "button", "__passkeySubmit" },
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Submit passkey action using only the button value marker
            var responseMessage = await PostLoginAsync(loginDataForm, loginResponse);

            // Assert status code
            responseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

            // Assert no validation/credential errors are shown
            (await GetValidationSummaryErrorsAsync(responseMessage)).Should().BeEmpty();
        }

        [Fact]
        public async Task PasskeyCredentialPayloadWithoutSubmitButtonShowsPasskeySpecificError()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            var (loginResponse, antiForgeryToken) = await GetLoginPageAsync();

            var loginDataForm = new Dictionary<string, string>
            {
                { "Passkey.CredentialJson", "{}" },
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Submit passkey credential payload without explicit submit markers
            var responseMessage = await PostLoginAsync(loginDataForm, loginResponse);

            // Assert status code
            responseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

            // Assert passkey-specific error message
            (await GetValidationSummaryErrorsAsync(responseMessage)).Should().Equal(AccountOptions.InvalidPasskeyErrorMessage);
        }

        [Fact]
        public async Task PasskeyErrorPayloadWithLoginButtonDoesNotValidateUsernameAndPassword()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            var (loginResponse, antiForgeryToken) = await GetLoginPageAsync();

            var loginDataForm = new Dictionary<string, string>
            {
                { "button", "login" },
                { "Passkey.Error", "No passkey was provided by the authenticator." },
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Submit passkey-style payload that should override the regular login button
            var responseMessage = await PostLoginAsync(loginDataForm, loginResponse);

            // Assert status code
            responseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

            // Assert no validation/credential errors are shown
            (await GetValidationSummaryErrorsAsync(responseMessage)).Should().BeEmpty();
        }

        [Fact]
        public async Task PasskeyCredentialPayloadWithLoginButtonShowsPasskeySpecificError()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            var (loginResponse, antiForgeryToken) = await GetLoginPageAsync();

            var loginDataForm = new Dictionary<string, string>
            {
                { "button", "login" },
                { "Passkey.CredentialJson", "{}" },
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Submit passkey payload that should take precedence over password login
            var responseMessage = await PostLoginAsync(loginDataForm, loginResponse);

            // Assert status code
            responseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

            // Assert passkey-specific error message
            (await GetValidationSummaryErrorsAsync(responseMessage)).Should().Equal(AccountOptions.InvalidPasskeyErrorMessage);
        }

        [Fact]
        public async Task CancelButtonWithPasskeyPayloadRedirectsHome()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            var (loginResponse, antiForgeryToken) = await GetLoginPageAsync();

            var loginDataForm = new Dictionary<string, string>
            {
                { "button", "cancel" },
                { "Passkey.CredentialJson", "{}" },
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Cancel login even if stale passkey payload is present
            var responseMessage = await PostLoginAsync(loginDataForm, loginResponse);

            // Assert redirect to home
            responseMessage.StatusCode.Should().Be(HttpStatusCode.Redirect);
            responseMessage.Headers.Location.Should().NotBeNull();
            responseMessage.Headers.Location!.ToString().Should().Be("/");
        }

        [Fact]
        public async Task PasskeySubmitInvalidCredentialShowsPasskeySpecificError()
        {
            // Clear headers
            Client.DefaultRequestHeaders.Clear();

            // Prepare request to login
            var (loginResponse, antiForgeryToken) = await GetLoginPageAsync();

            var loginDataForm = new Dictionary<string, string>
            {
                { "__passkeySubmit", "1" },
                { "button", "__passkeySubmit" },
                { "Passkey.CredentialJson", "{}" },
                { UserMocks.AntiForgeryTokenKey, antiForgeryToken }
            };

            // Submit invalid passkey payload
            var responseMessage = await PostLoginAsync(loginDataForm, loginResponse);

            // Assert status code
            responseMessage.StatusCode.Should().Be(HttpStatusCode.OK);

            // Assert passkey-specific error message
            (await GetValidationSummaryErrorsAsync(responseMessage)).Should().Equal(AccountOptions.InvalidPasskeyErrorMessage);
        }

        private async Task<(HttpResponseMessage LoginResponse, string AntiForgeryToken)> GetLoginPageAsync()
        {
            const string accountLoginAction = "/Account/Login";

            var loginResponse = await Client.GetAsync(accountLoginAction);
            var antiForgeryToken = await loginResponse.ExtractAntiForgeryToken();

            return (loginResponse, antiForgeryToken);
        }

        private async Task<HttpResponseMessage> PostLoginAsync(Dictionary<string, string> loginDataForm, HttpResponseMessage loginResponse)
        {
            const string accountLoginAction = "/Account/Login";

            var requestMessage = RequestHelper.CreatePostRequestWithCookies(accountLoginAction, loginDataForm, loginResponse);
            return await Client.SendAsync(requestMessage);
        }

        private static async Task<List<string>> GetValidationSummaryErrorsAsync(HttpResponseMessage responseMessage)
        {
            var content = await responseMessage.Content.ReadAsStringAsync();

            var doc = new HtmlDocument();
            doc.LoadHtml(content);

            var errorNodes = doc.DocumentNode
                .SelectNodes("//div[contains(@class, 'validation-summary-errors')]/ul/li");

            return errorNodes?.Select(node => node.InnerText).ToList() ?? new List<string>();
        }
    }
}
