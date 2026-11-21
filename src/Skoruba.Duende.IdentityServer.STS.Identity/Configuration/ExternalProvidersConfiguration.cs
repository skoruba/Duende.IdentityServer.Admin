// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Configuration
{
    public class ExternalProvidersConfiguration
    {
        public bool UseGitHubProvider { get; set; }
        public string GitHubClientId { get; set; }
        public string GitHubClientSecret { get; set; }        
        public string GitHubCallbackPath { get; set; }

        public bool UseAzureAdProvider { get; set; }
        public string AzureAdClientId { get; set; }
        public string AzureAdSecret { get; set; }
        public string AzureAdTenantId { get; set; }
        public string AzureInstance { get; set; }
        public string AzureAdCallbackPath { get; set; }
        public string AzureDomain { get; set; }
        public Dictionary<string, TokenExchangeProviderConfiguration> TokenExchangeProviders { get; set; } = new();
    }

    public class TokenExchangeProviderConfiguration
    {
        public bool Enabled { get; set; } = true;
        public string TenantId { get; set; }
        public string[] Authorities { get; set; } = Array.Empty<string>();
        public string Audience { get; set; }
        public string LoginProvider { get; set; }
        public string SubjectClaim { get; set; } = "sub";
        public string EmailClaim { get; set; }
    }
}
