// Original file comes from: https://github.com/damienbod/IdentityServer4AspNetCoreIdentityTemplate
// Modified by Jan Škoruba

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Azure.Core;
using Azure.Identity;
using Azure.Security.KeyVault.Certificates;
using Azure.Security.KeyVault.Secrets;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Common;

namespace Skoruba.Duende.IdentityServer.Shared.Configuration.Services
{
    public class AzureKeyVaultService
    {
        private readonly AzureKeyVaultConfiguration _azureKeyVaultConfiguration;

        public AzureKeyVaultService(AzureKeyVaultConfiguration azureKeyVaultConfiguration)
        {
            if (azureKeyVaultConfiguration == null)
            {
                throw new ArgumentException("missing azureKeyVaultConfiguration");
            }

            if (string.IsNullOrEmpty(azureKeyVaultConfiguration.AzureKeyVaultEndpoint))
            {
                throw new ArgumentException("missing keyVaultEndpoint");
            }

            _azureKeyVaultConfiguration = azureKeyVaultConfiguration;
        }

        public async Task<(X509Certificate2 ActiveCertificate, X509Certificate2 SecondaryCertificate)> GetCertificatesFromKeyVault()
        {
            (X509Certificate2 ActiveCertificate, X509Certificate2 SecondaryCertificate) certs = (null, null);

            // Create clients using the credentials built earlier
            var credential = BuildKeyVaultClient();
            var certificateClient = new CertificateClient(new Uri(_azureKeyVaultConfiguration.AzureKeyVaultEndpoint), credential);
            var secretClient = new SecretClient(new Uri(_azureKeyVaultConfiguration.AzureKeyVaultEndpoint), credential);

            // Get all enabled certificate versions
            var certificateItems = GetAllEnabledCertificateVersions(certificateClient);
            var item = certificateItems.FirstOrDefault();
            if (item != null)
            {
                certs.ActiveCertificate = await GetCertificateAsync(
                    secretClient, _azureKeyVaultConfiguration.IdentityServerCertificateName, item.Version);
            }

            if (certificateItems.Count > 1)
            {
                certs.SecondaryCertificate = await GetCertificateAsync(
                    secretClient, _azureKeyVaultConfiguration.IdentityServerCertificateName, certificateItems[1].Version);
            }

            return certs;
        }

        private TokenCredential BuildKeyVaultClient()
        {
            TokenCredential credential;

            if (_azureKeyVaultConfiguration.UseClientCredentials)
            {
                // Use ClientSecretCredential for client credentials authentication
                credential = new ClientSecretCredential(
                    _azureKeyVaultConfiguration.TenantId,
                    _azureKeyVaultConfiguration.ClientId,
                    _azureKeyVaultConfiguration.ClientSecret);
            }
            else
            {
                // Use DefaultAzureCredential for managed identity or other default authentication methods
                credential = new DefaultAzureCredential();
            }

            return credential;
        }

        private List<CertificateProperties> GetAllEnabledCertificateVersions(CertificateClient certificateClient)
        {
            var certificateVersions = certificateClient.GetPropertiesOfCertificateVersions(_azureKeyVaultConfiguration.IdentityServerCertificateName);
            
            // Find all enabled versions of the certificate and sort them by creation date in decending order 
            return certificateVersions
                .Where(certVersion => certVersion.Enabled.HasValue && certVersion.Enabled.Value)
                .OrderByDescending(certVersion => certVersion.CreatedOn)
                .ToList();
        }

        private async Task<X509Certificate2> GetCertificateAsync(
            SecretClient secretClient,
            string certName,
            string version)
        {
            // Create a new secret using the secret client.
            KeyVaultSecret secret = await secretClient.GetSecretAsync(certName, version);

            var privateKeyBytes = Convert.FromBase64String(secret.Value);

            var certificateWithPrivateKey = new X509Certificate2(privateKeyBytes,
                (string)null,
                X509KeyStorageFlags.MachineKeySet);

            return certificateWithPrivateKey;
        }
    }
}
