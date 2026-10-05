// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Duende.IdentityServer.Models;
using Duende.IdentityServer.Validation;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Skoruba.Duende.IdentityServer.STS.Identity.Configuration;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Helpers
{
    /// <summary>
    /// RFC 8693 token exchange: swaps a validated external subject_token for a local token of an already-linked user.
    /// Unknown identities (no matching UserLogins entry) are rejected; this grant does not auto-link or auto-register users.
    /// </summary>
    public class TokenExchangeGrantValidator<TUser> : IExtensionGrantValidator
        where TUser : class
    {
        public const string GrantTypeValue = "urn:ietf:params:oauth:grant-type:token-exchange";

        private const string JwtTokenType = "urn:ietf:params:oauth:token-type:jwt";
        private const string AccessTokenType = "urn:ietf:params:oauth:token-type:access_token";
        private const string SubjectTokenParam = "subject_token";
        private const string SubjectTokenTypeParam = "subject_token_type";
        private const string ProviderParam = "provider";

        private static readonly ConcurrentDictionary<string, ConfigurationManager<OpenIdConnectConfiguration>> ConfigManagers = new();

        private readonly UserManager<TUser> _userManager;
        private readonly ExternalProvidersConfiguration _externalProvidersConfiguration;
        private readonly ILogger<TokenExchangeGrantValidator<TUser>> _logger;

        public TokenExchangeGrantValidator(
            UserManager<TUser> userManager,
            ExternalProvidersConfiguration externalProvidersConfiguration,
            ILogger<TokenExchangeGrantValidator<TUser>> logger)
        {
            _userManager = userManager;
            _externalProvidersConfiguration = externalProvidersConfiguration;
            _logger = logger;
        }

        public string GrantType => GrantTypeValue;

        public async Task ValidateAsync(ExtensionGrantValidationContext context, CancellationToken cancellationToken = default)
        {
            var subjectToken = context.Request.Raw.Get(SubjectTokenParam);
            var subjectTokenType = context.Request.Raw.Get(SubjectTokenTypeParam);

            if (string.IsNullOrWhiteSpace(subjectToken) ||
                (subjectTokenType != JwtTokenType && subjectTokenType != AccessTokenType))
            {
                context.Result = new GrantValidationResult(TokenRequestErrors.InvalidRequest, "invalid or missing subject_token/subject_token_type");
                return;
            }

            var providerName = context.Request.Raw.Get(ProviderParam);
            if (string.IsNullOrWhiteSpace(providerName))
            {
                context.Result = new GrantValidationResult(TokenRequestErrors.InvalidRequest, "missing provider");
                return;
            }

            var provider = GetProviderConfiguration(providerName);
            if (provider == null)
            {
                context.Result = new GrantValidationResult(TokenRequestErrors.InvalidTarget, "token exchange provider is not configured");
                return;
            }

            ClaimsPrincipal principal;
            try
            {
                principal = await ValidateTokenAsync(subjectToken, provider, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Token exchange: subject_token failed validation");
                context.Result = new GrantValidationResult(TokenRequestErrors.InvalidGrant);
                return;
            }

            if (!string.IsNullOrWhiteSpace(provider.TenantId))
            {
                var tokenTenantId = principal.FindFirst("tid")?.Value;
                if (!string.Equals(tokenTenantId, provider.TenantId, StringComparison.OrdinalIgnoreCase))
                {
                    context.Result = new GrantValidationResult(TokenRequestErrors.InvalidGrant, "subject_token tenant does not match the configured provider");
                    return;
                }
            }

            var providerKey = principal.FindFirst(provider.SubjectClaim)?.Value;
            if (string.IsNullOrWhiteSpace(providerKey) && provider.SubjectClaim == "oid")
            {
                providerKey = principal.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value;
            }

            if (string.IsNullOrWhiteSpace(providerKey))
            {
                context.Result = new GrantValidationResult(TokenRequestErrors.InvalidGrant, $"subject_token is missing the {provider.SubjectClaim} claim");
                return;
            }

            var subject = principal.FindFirst("sub")?.Value;
            var user = await _userManager.FindByLoginAsync(provider.LoginProvider, providerKey)
                ?? (string.IsNullOrWhiteSpace(subject) || subject == providerKey
                    ? null
                    : await _userManager.FindByLoginAsync(provider.LoginProvider, subject));
            if (user == null && !string.IsNullOrWhiteSpace(provider.EmailClaim))
            {
                var email = principal.FindFirst(provider.EmailClaim)?.Value;
                if (!string.IsNullOrWhiteSpace(email))
                {
                    user = await _userManager.FindByEmailAsync(email);
                }
            }

            if (user == null)
            {
                context.Result = new GrantValidationResult(TokenRequestErrors.InvalidGrant, "no local account is linked to this identity");
                return;
            }

            var localSubject = await _userManager.GetUserIdAsync(user);
            context.Result = new GrantValidationResult(localSubject, GrantType);
        }

        private TokenExchangeProviderConfiguration GetProviderConfiguration(string providerName)
        {
            if (!string.IsNullOrWhiteSpace(providerName) &&
                _externalProvidersConfiguration.TokenExchangeProviders.TryGetValue(providerName, out var configuredProvider) &&
                configuredProvider.Enabled)
            {
                return configuredProvider;
            }

            return null;
        }

        private async Task<ClaimsPrincipal> ValidateTokenAsync(string token, TokenExchangeProviderConfiguration provider, CancellationToken cancellationToken)
        {
            var authorities = provider.Authorities.Where(authority => !string.IsNullOrWhiteSpace(authority))
                .Select(authority => authority.TrimEnd('/'))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            if (authorities.Length == 0 || string.IsNullOrWhiteSpace(provider.Audience) || string.IsNullOrWhiteSpace(provider.LoginProvider))
            {
                throw new SecurityTokenException("Token exchange provider configuration is incomplete.");
            }

            var configManagers = authorities.Select(authority => ConfigManagers.GetOrAdd(authority, value => new ConfigurationManager<OpenIdConnectConfiguration>(
                $"{value}/.well-known/openid-configuration",
                new OpenIdConnectConfigurationRetriever())))
                .ToArray();
            var configurations = await Task.WhenAll(configManagers.Select(manager => manager.GetConfigurationAsync(cancellationToken)));
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuers = configurations.Select(configuration => configuration.Issuer).ToArray(),
                ValidateAudience = true,
                ValidAudience = provider.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = configurations.SelectMany(configuration => configuration.SigningKeys).ToArray(),
                ValidateLifetime = true
            };

            var handler = new JwtSecurityTokenHandler { MapInboundClaims = false };
            return handler.ValidateToken(token, validationParameters, out _);
        }
    }
}