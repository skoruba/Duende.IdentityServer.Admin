using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using Duende.IdentityServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Common;
using Skoruba.Duende.IdentityServer.Shared.Configuration.Helpers;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Helpers
{
    public static class IdentityServerBuilderExtensions
    {
        private const string CertificateNotFound = "Certificate not found";
        private const string SigningCertificateThumbprintNotFound = "Signing certificate thumbprint not found";
        private const string SigningCertificatePathIsNotSpecified = "Signing certificate file path is not specified";

        private const string ValidationCertificateThumbprintNotFound = "Validation certificate thumbprint not found";
        private const string ValidationCertificatePathIsNotSpecified = "Validation certificate file path is not specified";

        private const string NistP256Oid = "1.2.840.10045.3.1.7";
        private static readonly string[] NistP256Names = { "nistP256", "ECDSA_P256", "secp256r1", "prime256v1" };

        /// <summary>
        /// Add custom signing certificate from certification store according thumbprint or from file
        /// </summary>
        /// <param name="builder"></param>
        /// <param name="configuration"></param>
        /// <param name="useFapi2SigningAlgorithm">Signs with PS256 (RSA key) or ES256 (EC key) instead of the RS256 default</param>
        /// <returns></returns>
        public static IIdentityServerBuilder AddCustomSigningCredential(this IIdentityServerBuilder builder, IConfiguration configuration, bool useFapi2SigningAlgorithm = false)
        {
            var certificateConfiguration = configuration.GetSection(nameof(CertificateConfiguration)).Get<CertificateConfiguration>();
            var azureKeyVaultConfiguration = configuration.GetSection(nameof(AzureKeyVaultConfiguration)).Get<AzureKeyVaultConfiguration>();

            if (certificateConfiguration.UseSigningCertificateThumbprint)
            {
                if (string.IsNullOrWhiteSpace(certificateConfiguration.SigningCertificateThumbprint))
                {
                    throw new Exception(SigningCertificateThumbprintNotFound);
                }

                StoreLocation storeLocation = StoreLocation.LocalMachine;
                bool validOnly = certificateConfiguration.CertificateValidOnly;

                // Parse the Certificate StoreLocation
                string certStoreLocationLower = certificateConfiguration.CertificateStoreLocation.ToLower();
                if (certStoreLocationLower == StoreLocation.CurrentUser.ToString().ToLower() ||
                    certificateConfiguration.CertificateStoreLocation == ((int)StoreLocation.CurrentUser).ToString())
                {
                    storeLocation = StoreLocation.CurrentUser;
                }
                else if (certStoreLocationLower == StoreLocation.LocalMachine.ToString().ToLower() ||
                         certStoreLocationLower == ((int)StoreLocation.LocalMachine).ToString())
                {
                    storeLocation = StoreLocation.LocalMachine;
                }
                else { storeLocation = StoreLocation.LocalMachine; validOnly = true; }

                // Open Certificate
                var certStore = new X509Store(StoreName.My, storeLocation);
                certStore.Open(OpenFlags.ReadOnly);

                var certCollection = certStore.Certificates.Find(X509FindType.FindByThumbprint, certificateConfiguration.SigningCertificateThumbprint, validOnly);
                if (certCollection.Count == 0)
                {
                    throw new Exception(CertificateNotFound);
                }

                var certificate = certCollection[0];

                builder.AddSigningCredential(certificate, GetSigningAlgorithm(certificate, useFapi2SigningAlgorithm));
            }
            else if (certificateConfiguration.UseSigningCertificateForAzureKeyVault)
            {
                var x509Certificate2Certs = AzureKeyVaultHelpers.GetCertificates(azureKeyVaultConfiguration).GetAwaiter().GetResult();

                builder.AddSigningCredential(x509Certificate2Certs.ActiveCertificate,
                    GetSigningAlgorithm(x509Certificate2Certs.ActiveCertificate, useFapi2SigningAlgorithm));
            }
            else if (certificateConfiguration.UseSigningCertificatePfxFile)
            {
                if (string.IsNullOrWhiteSpace(certificateConfiguration.SigningCertificatePfxFilePath))
                {
                    throw new Exception(SigningCertificatePathIsNotSpecified);
                }

                if (File.Exists(certificateConfiguration.SigningCertificatePfxFilePath))
                {

                    try
                    {
                        var bytes = File.ReadAllBytes(certificateConfiguration.SigningCertificatePfxFilePath);
                        var cert = X509CertificateLoader.LoadPkcs12(bytes, certificateConfiguration.SigningCertificatePfxFilePassword);
    
                        builder.AddSigningCredential(cert, GetSigningAlgorithm(cert, useFapi2SigningAlgorithm));
                    }
                    catch (Exception e) when (e is not InvalidOperationException)
                    {
                        throw new Exception("There was an error adding the key file - during the creation of the signing key", e);
                    }
                }
                else
                {
                    throw new Exception($"Signing key file: {certificateConfiguration.SigningCertificatePfxFilePath} not found");
                }
            }
            else if (certificateConfiguration.UseTemporarySigningKeyForDevelopment)
            {
                builder.AddDeveloperSigningCredential(signingAlgorithm: useFapi2SigningAlgorithm
                    ? IdentityServerConstants.RsaSigningAlgorithm.PS256
                    : IdentityServerConstants.RsaSigningAlgorithm.RS256);
            }
            else
            {
                throw new Exception("Signing credential is not specified");
            }

            return builder;
        }

        /// <summary>
        /// Add custom validation key for signing key rollover
        /// http://docs.identityserver.io/en/latest/topics/crypto.html#signing-key-rollover
        /// </summary>
        /// <param name="builder"></param>
        /// <param name="configuration"></param>
        /// <param name="useFapi2SigningAlgorithm">Publishes the key with PS256 (RSA key) or ES256 (EC key) instead of the RS256 default</param>
        /// <returns></returns>
        public static IIdentityServerBuilder AddCustomValidationKey(this IIdentityServerBuilder builder, IConfiguration configuration, bool useFapi2SigningAlgorithm = false)
        {
            var certificateConfiguration = configuration.GetSection(nameof(CertificateConfiguration)).Get<CertificateConfiguration>();
            var azureKeyVaultConfiguration = configuration.GetSection(nameof(AzureKeyVaultConfiguration)).Get<AzureKeyVaultConfiguration>();

            if (certificateConfiguration.UseValidationCertificateThumbprint)
            {
                if (string.IsNullOrWhiteSpace(certificateConfiguration.ValidationCertificateThumbprint))
                {
                    throw new Exception(ValidationCertificateThumbprintNotFound);
                }

                var certStore = new X509Store(StoreName.My, StoreLocation.LocalMachine);
                certStore.Open(OpenFlags.ReadOnly);

                var certCollection = certStore.Certificates.Find(X509FindType.FindByThumbprint, certificateConfiguration.ValidationCertificateThumbprint, false);
                if (certCollection.Count == 0)
                {
                    throw new Exception(CertificateNotFound);
                }

                var certificate = certCollection[0];

                builder.AddValidationKey(certificate, GetSigningAlgorithm(certificate, useFapi2SigningAlgorithm));

            }
            else if (certificateConfiguration.UseValidationCertificateForAzureKeyVault)
            {
                var x509Certificate2Certs = AzureKeyVaultHelpers.GetCertificates(azureKeyVaultConfiguration).GetAwaiter().GetResult();

                if (x509Certificate2Certs.SecondaryCertificate != null)
                {
                    builder.AddValidationKey(x509Certificate2Certs.SecondaryCertificate,
                        GetSigningAlgorithm(x509Certificate2Certs.SecondaryCertificate, useFapi2SigningAlgorithm));
                }
            }
            else if (certificateConfiguration.UseValidationCertificatePfxFile)
            {
                if (string.IsNullOrWhiteSpace(certificateConfiguration.ValidationCertificatePfxFilePath))
                {
                    throw new Exception(ValidationCertificatePathIsNotSpecified);
                }

                if (File.Exists(certificateConfiguration.ValidationCertificatePfxFilePath))
                {
                    try
                    {
                        var validationCertBytes = File.ReadAllBytes(certificateConfiguration.ValidationCertificatePfxFilePath);
                        var validationCertificate = X509CertificateLoader.LoadPkcs12(
                            validationCertBytes,
                            certificateConfiguration.ValidationCertificatePfxFilePassword);

                        builder.AddValidationKey(validationCertificate, GetSigningAlgorithm(validationCertificate, useFapi2SigningAlgorithm));
                    }
                    catch (Exception e) when (e is not InvalidOperationException)
                    {
                        throw new Exception("There was an error adding the key file - during the creation of the validation key", e);
                    }
                }
                else
                {
                    throw new Exception($"Validation key file: {certificateConfiguration.ValidationCertificatePfxFilePath} not found");
                }
            }

            return builder;
        }

        /// <summary>
        /// FAPI 2.0 allows PS256 and ES256 only, so the algorithm follows the key type of the certificate.
        /// ES256 is ECDSA over P-256 and nothing else - IdentityServer does not check the curve of a
        /// certificate, so a P-384 or P-521 key would sign tokens that only claim to be ES256.
        /// Without the profile the certificate keeps the RS256 default of IdentityServer.
        /// </summary>
        private static string GetSigningAlgorithm(X509Certificate2 certificate, bool useFapi2SigningAlgorithm)
        {
            if (!useFapi2SigningAlgorithm)
            {
                return SecurityAlgorithms.RsaSha256;
            }

            using var ecdsaPublicKey = certificate.GetECDsaPublicKey();
            if (ecdsaPublicKey != null)
            {
                var curve = ecdsaPublicKey.ExportParameters(false).Curve;
                if (!IsNistP256(curve))
                {
                    throw new InvalidOperationException(
                        $"The FAPI 2.0 security profile cannot use the certificate '{certificate.Subject}' ({certificate.Thumbprint}): " +
                        $"its EC key is on the curve '{curve.Oid?.FriendlyName ?? curve.Oid?.Value ?? "unknown"}', but ES256 requires P-256. " +
                        "Use a P-256 or an RSA certificate, or turn the profile off.");
                }

                return SecurityAlgorithms.EcdsaSha256;
            }

            using var rsaPublicKey = certificate.GetRSAPublicKey();
            if (rsaPublicKey != null)
            {
                return SecurityAlgorithms.RsaSsaPssSha256;
            }

            throw new InvalidOperationException(
                $"The FAPI 2.0 security profile cannot use the certificate '{certificate.Subject}' ({certificate.Thumbprint}): " +
                "only RSA (PS256) and EC P-256 (ES256) keys are supported.");
        }

        private static bool IsNistP256(ECCurve curve)
        {
            // The platforms do not agree on what they fill in - the OID value, the friendly name, or both
            return curve.IsNamed
                   && (curve.Oid.Value == NistP256Oid
                       || (string.IsNullOrEmpty(curve.Oid.Value) && NistP256Names.Contains(curve.Oid.FriendlyName, StringComparer.OrdinalIgnoreCase)));
        }
    }
}
