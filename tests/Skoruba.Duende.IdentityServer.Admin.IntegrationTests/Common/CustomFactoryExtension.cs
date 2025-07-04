// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http;
using Skoruba.Duende.IdentityServer.Admin.UI.Middlewares;

namespace Skoruba.Duende.IdentityServer.Admin.IntegrationTests.Common
{
    public static class CustomFactoryExtension
    {
        public static HttpClient Create(this CustomWebApplicationFactory factory)
        {
            var options = new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            };
            return factory.CreateClient(options);
        }

        public static HttpClient NoAuthClient(this HttpClient client)
        {
            var _client = client;
            _client.DefaultRequestHeaders.Add(AuthenticatedTestRequestMiddleware.AddCustomeOverrideEnabled, "false");
            return _client;
        }
    }
}
