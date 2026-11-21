namespace Skoruba.Duende.IdentityServer.Shared.Configuration.Constants
{
    /// <summary>
    /// Health endpoints of the STS and the Admin API. <c>/health/live</c> runs no checks, so an outage of a
    /// dependency never restarts the process; <c>/health/ready</c> runs the checks tagged <see cref="ReadyTag"/>
    /// and keeps traffic away until the instance can serve requests; <c>/health</c> runs every check.
    /// </summary>
    public static class HealthCheckEndpoints
    {
        public const string Health = "/health";
        public const string Live = "/health/live";
        public const string Ready = "/health/ready";

        public const string ReadyTag = "ready";
    }
}
