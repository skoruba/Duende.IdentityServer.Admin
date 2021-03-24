// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Common
{
    public class AzureKeyVaultConfiguration
    {
        public string AzureKeyVaultEndpoint { get; set; }

        public string TenantId { get; set; }

        public string ClientId { get; set; }

        public string ClientSecret { get; set; }

        public bool UseClientCredentials { get; set; }

        public string IdentityServerCertificateName { get; set; }

        public string DataProtectionKeyIdentifier { get; set; }

        public bool ReadConfigurationFromKeyVault { get; set; }
    }
}