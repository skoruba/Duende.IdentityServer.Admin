using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace SMSSender
{
    public class LogSMSSender: ISMSSender
    {
        private readonly ILogger<LogSMSSender> _logger;

        public LogSMSSender(ILogger<LogSMSSender> logger)
        {
            _logger = logger;
        }

        public Task<string> SendSMSAsync(string number, string message)
        {
            _logger.LogInformation($"nubmer: {number} message: {message}");

            return Task.FromResult("");
        }
    }
}
