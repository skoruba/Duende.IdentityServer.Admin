using Duende.IdentityServer.Events;
using Duende.IdentityServer.Services;
using Microsoft.Extensions.Logging;
using Serilog;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks; 

namespace Skoruba.Duende.IdentityServer.STS.Identity.Helpers
{
    public class CustomEventSink : IEventSink
    {
        private readonly ILogger<CustomEventSink> _logger;
        public CustomEventSink(ILogger<CustomEventSink> logger)
        {
            _logger = logger;
        }

        public Task PersistAsync(Event evt)
        {
            // Log username for login events
            switch (evt)
            {
                case UserLoginSuccessEvent success:
                    _logger.LogInformation("Login SUCCESS: Username={Username}, SubjectId={SubjectId}, ClientId={ClientId}, RemoteIpAddress={RemoteIpAddress}",
                        success.Username, success.SubjectId, success.ClientId, success.RemoteIpAddress);
                    break;
                case UserLoginFailureEvent failure:
                    _logger.LogWarning("Login FAILURE: Username={Username}, Error={Error}, ClientId={ClientId}, RemoteIpAddress={RemoteIpAddress}",
                        failure.Username, failure.Message, failure.ClientId, failure.RemoteIpAddress);
                    break;
                default:
                    // Fallback to generic event logging
                    var eventData = JsonSerializer.Serialize(evt, new JsonSerializerOptions
                    {
                        WriteIndented = false,
                        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });

                    _logger.LogInformation("Duende Event: {EventType} | {Name} | {Category} | Client: {ClientId} | Subject: {SubjectId} | Details: {Data}",
                        evt.EventType,
                        evt.Name,
                        evt.Category,
                        evt.LocalIpAddress,
                        evt.RemoteIpAddress,
                        eventData);
                    break;
            }

            return Task.CompletedTask;
        }
    }
}
