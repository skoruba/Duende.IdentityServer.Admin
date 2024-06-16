// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using Microsoft.AspNetCore.Authorization;
using NSwag;
using NSwag.Generation.Processors;
using NSwag.Generation.Processors.Contexts;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Authorization
{
    public class AuthorizeCheckOperationProcessor : IOperationProcessor
    {
        private readonly AdminApiConfiguration _adminApiConfiguration;

        public AuthorizeCheckOperationProcessor(AdminApiConfiguration adminApiConfiguration)
        {
            _adminApiConfiguration = adminApiConfiguration;
        }

        public bool Process(OperationProcessorContext context)
        {
            var hasAuthorize = context.ControllerType.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any() ||
                               context.MethodInfo.GetCustomAttributes(true).OfType<AuthorizeAttribute>().Any();

            if (hasAuthorize)
            {
                context.OperationDescription.Operation.Responses.Add("401", new OpenApiResponse { Description = "Unauthorized" });
                context.OperationDescription.Operation.Responses.Add("403", new OpenApiResponse { Description = "Forbidden" });

                var oauth2Scheme = new OpenApiSecurityRequirement
                {
                    ["OAuth2"] = new[] { _adminApiConfiguration.OidcApiName }
                };

                context.OperationDescription.Operation.Security.Add(oauth2Scheme);
            }

            return true;
        }
    }
}