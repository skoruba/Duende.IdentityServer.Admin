// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Bogus;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Clients;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Constants;

namespace Skoruba.Duende.IdentityServer.Admin.Api.UnitTests.Mocks
{
    public static class ClientDtoApiMock
    {
        public static ClientApiDto GenerateRandomClient(int id)
        {
            var clientFaker = ClientFaker(id);

            var clientTesting = clientFaker.Generate();

            return clientTesting;
        }

        public static List<string> GetScopes()
        {
            var scopes = new List<string>
            {
                "openid",
                "profile",
                "email"
            };

            return scopes;
        }

        public static List<string> GetIdentityProviders()
        {
            var providers = new List<string>
            {
                "facebook",
                "google"
            };

            return providers;
        }

        public static ClientClaimApiDto GenerateRandomClientClaim(int id)
        {
            var clientClaimFaker = ClientClaimFaker(id);

            var clientClaimTesting = clientClaimFaker.Generate();

            return clientClaimTesting;
        }

        public static ClientPropertyApiDto GenerateRandomClientProperty(int id)
        {
            var clientPropertyFaker = ClientPropertyFaker(id);

            var clientPropertyTesting = clientPropertyFaker.Generate();

            return clientPropertyTesting;
        }

        public static ClientCloneApiDto GenerateClientCloneDto(int id, bool cloneClientClaims = true,
            bool cloneClientCorsOrigins = true, bool cloneClientGrantTypes = true, bool cloneClientIdPRestrictions = true,
            bool cloneClientPostLogoutRedirectUris = true, bool cloneClientProperties = true,
            bool cloneClientRedirectUris = true, bool cloneClientScopes = true)
        {
            var clientCloneFaker = ClientCloneFaker(id, cloneClientClaims, cloneClientCorsOrigins,
                cloneClientGrantTypes, cloneClientIdPRestrictions, cloneClientPostLogoutRedirectUris,
                cloneClientProperties, cloneClientRedirectUris, cloneClientScopes);

            var clientCloneDto = clientCloneFaker.Generate();

            return clientCloneDto;
        }

        public static ClientSecretApiDto GenerateRandomClientSecret(int id)
        {
            var clientSecretFaker = ClientSecretFaker(id);

            var clientSecretTesting = clientSecretFaker.Generate();

            return clientSecretTesting;
        }

        public static List<string> AllowedSigningAlgorithms()
        {
            var algs = new List<string>
            {
                "RS256",
                "RS512",
                "ES256",
                "ES384",
                "ES512"
            };

            return algs;
        }

        public static Faker<ClientApiDto> ClientFaker(int id)
        {
            var clientFaker = new Faker<ClientApiDto>()
               .StrictMode(false)
               .RuleFor(o => o.ClientId, f => Guid.NewGuid().ToString())
               .RuleFor(o => o.ClientName, f => Guid.NewGuid().ToString())
               .RuleFor(o => o.Id, id)
               .RuleFor(o => o.AbsoluteRefreshTokenLifetime, f => f.Random.Number(int.MaxValue))
               .RuleFor(o => o.AccessTokenLifetime, f => f.Random.Number(int.MaxValue))
               .RuleFor(o => o.AccessTokenType, f => f.Random.Number(0, 1))
               .RuleFor(o => o.AllowAccessTokensViaBrowser, f => f.Random.Bool())
               .RuleFor(o => o.AllowOfflineAccess, f => f.Random.Bool())
               .RuleFor(o => o.AllowPlainTextPkce, f => f.Random.Bool())
               .RuleFor(o => o.AllowRememberConsent, f => f.Random.Bool())
               .RuleFor(o => o.AllowedCorsOrigins, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => f.PickRandom(f.Internet.Url())).ToList())
               .RuleFor(o => o.AllowedGrantTypes, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => f.PickRandom(ClientConsts.GetGrantTypes())).ToList())
               .RuleFor(o => o.AllowedScopes, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => f.PickRandom(GetScopes())).ToList())
               .RuleFor(o => o.AlwaysIncludeUserClaimsInIdToken, f => f.Random.Bool())
               .RuleFor(o => o.Enabled, f => f.Random.Bool())
               .RuleFor(o => o.ProtocolType, f => f.PickRandom(ClientConsts.GetProtocolTypes().Select(x => x.Id)))
               .RuleFor(o => o.RequireClientSecret, f => f.Random.Bool())
               .RuleFor(o => o.Description, f => f.Random.Words(f.Random.Number(1, 7)))
               .RuleFor(o => o.ClientUri, f => f.Internet.Url())
               .RuleFor(o => o.RequireConsent, f => f.Random.Bool())
               .RuleFor(o => o.RequirePkce, f => f.Random.Bool())
               .RuleFor(o => o.RedirectUris, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => f.PickRandom(f.Internet.Url())).ToList())
               .RuleFor(o => o.PostLogoutRedirectUris, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => f.PickRandom(f.Internet.Url())).ToList())
               .RuleFor(o => o.FrontChannelLogoutUri, f => f.Internet.Url())
               .RuleFor(o => o.FrontChannelLogoutSessionRequired, f => f.Random.Bool())
               .RuleFor(o => o.BackChannelLogoutUri, f => f.Internet.Url())
               .RuleFor(o => o.BackChannelLogoutSessionRequired, f => f.Random.Bool())
               .RuleFor(o => o.IdentityTokenLifetime, f => f.Random.Number(int.MaxValue))
               .RuleFor(o => o.AuthorizationCodeLifetime, f => f.Random.Number(int.MaxValue))
               .RuleFor(o => o.ConsentLifetime, f => f.Random.Number(int.MaxValue))
               .RuleFor(o => o.SlidingRefreshTokenLifetime, f => f.Random.Number(int.MaxValue))
               .RuleFor(o => o.RefreshTokenUsage, f => f.Random.Number(0, 1))
               .RuleFor(o => o.UpdateAccessTokenClaimsOnRefresh, f => f.Random.Bool())
               .RuleFor(o => o.RefreshTokenExpiration, f => f.Random.Number(int.MaxValue))
               .RuleFor(o => o.EnableLocalLogin, f => f.Random.Bool())
               .RuleFor(o => o.AlwaysSendClientClaims, f => f.Random.Bool())
               .RuleFor(o => o.ClientClaimsPrefix, f => Guid.NewGuid().ToString())
               .RuleFor(o => o.IncludeJwtId, f => f.Random.Bool())
               .RuleFor(o => o.PairWiseSubjectSalt, f => Guid.NewGuid().ToString())
               .RuleFor(o => o.IdentityProviderRestrictions, f => Enumerable.Range(1, f.Random.Int(1, 10)).Select(x => f.PickRandom(GetIdentityProviders())).ToList())
               .RuleFor(o => o.LogoUri, f => f.Internet.Url())
               .RuleFor(o => o.Updated, f => f.Date.Recent())
               .RuleFor(o => o.LastAccessed, f => f.Date.Recent())
               .RuleFor(o => o.UserSsoLifetime, f => f.Random.Int())
               .RuleFor(o => o.UserCodeType, f => f.Random.Word())
               .RuleFor(o => o.DeviceCodeLifetime, f => f.Random.Int())
               .RuleFor(o => o.RequireRequestObject, f => f.Random.Bool())
               .RuleFor(o => o.AllowedIdentityTokenSigningAlgorithms, f => AllowedSigningAlgorithms().Take(f.Random.Number(1, 5)).ToList());

            return clientFaker;
        }

        public static Faker<ClientClaimApiDto> ClientClaimFaker(int id)
        {
            var clientClaimFaker = new Faker<ClientClaimApiDto>()
                .StrictMode(false)
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Type, f => f.PickRandom(ClientConsts.GetStandardClaims()))
                .RuleFor(o => o.Value, f => Guid.NewGuid().ToString());

            return clientClaimFaker;
        }

        public static Faker<ClientSecretApiDto> ClientSecretFaker(int id)
        {
            var clientSecretFaker = new Faker<ClientSecretApiDto>()
                .StrictMode(false)
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Type, f => f.PickRandom(ClientConsts.GetSecretTypes()))
                .RuleFor(o => o.Value, f => Guid.NewGuid().ToString());

            return clientSecretFaker;
        }

        public static Faker<ClientPropertyApiDto> ClientPropertyFaker(int id)
        {
            var clientPropertyFaker = new Faker<ClientPropertyApiDto>()
                .StrictMode(false)
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.Key, f => Guid.NewGuid().ToString())
                .RuleFor(o => o.Value, f => Guid.NewGuid().ToString());

            return clientPropertyFaker;
        }

        public static Faker<ClientCloneApiDto> ClientCloneFaker(int id, bool cloneClientClaims,
        bool cloneClientCorsOrigins, bool cloneClientGrantTypes, bool cloneClientIdPRestrictions,
        bool cloneClientPostLogoutRedirectUris, bool cloneClientProperties,
        bool cloneClientRedirectUris, bool cloneClientScopes)
        {
            var clientCloneDto = new Faker<ClientCloneApiDto>()
                .StrictMode(false)
                .RuleFor(o => o.Id, id)
                .RuleFor(o => o.CloneClientClaims, cloneClientClaims)
                .RuleFor(o => o.CloneClientCorsOrigins, cloneClientCorsOrigins)
                .RuleFor(o => o.CloneClientGrantTypes, cloneClientGrantTypes)
                .RuleFor(o => o.CloneClientIdPRestrictions, cloneClientIdPRestrictions)
                .RuleFor(o => o.CloneClientPostLogoutRedirectUris, cloneClientPostLogoutRedirectUris)
                .RuleFor(o => o.CloneClientProperties, cloneClientProperties)
                .RuleFor(o => o.CloneClientRedirectUris, cloneClientRedirectUris)
                .RuleFor(o => o.CloneClientScopes, cloneClientScopes);

            return clientCloneDto;
        }
    }
}
