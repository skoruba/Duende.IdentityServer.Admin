using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Duende.IdentityServer.Services;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace SkorubaDuende.IdentityServerAdmin.STS.Identity.Helpers
{
    /// <summary>
    /// The STS cannot issue a token without a signing key. With automatic key management the keys are
    /// loaded from the store and unprotected on first use, so the readiness probe also does that work
    /// before the first sign-in reaches a new instance.
    /// </summary>
    public class SigningKeysHealthCheck : IHealthCheck
    {
        private readonly IKeyMaterialService _keyMaterialService;

        public SigningKeysHealthCheck(IKeyMaterialService keyMaterialService)
        {
            _keyMaterialService = keyMaterialService;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            var credentials = await _keyMaterialService.GetAllSigningCredentialsAsync(cancellationToken);

            return credentials.Any()
                ? HealthCheckResult.Healthy()
                : new HealthCheckResult(context.Registration.FailureStatus, "No signing key is available");
        }
    }
}
