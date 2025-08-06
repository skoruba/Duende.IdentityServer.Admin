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
            var eventData = JsonSerializer.Serialize(evt, new JsonSerializerOptions
            {
                WriteIndented = false,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull, // Updated to fix SYSLIB0020
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            _logger.LogInformation("Duende Event: {EventType} | {Name} | {Category} | Client: {ClientId} | Subject: {SubjectId} | Details: {Data}",
                evt.EventType,
                evt.Name,
                evt.Category,
                evt.LocalIpAddress,
                evt.RemoteIpAddress,
                eventData);

            return Task.CompletedTask;
        }
    }
}
