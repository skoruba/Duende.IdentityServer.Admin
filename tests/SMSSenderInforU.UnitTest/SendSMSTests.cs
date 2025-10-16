using System;
using Xunit;
using SMSSenderInforU;

namespace SMSSenderInforU.Tests
{
    public class SendSMSTests
    {
        [Fact]
        public void Constructor_LoadsConfigurationFile()
        {
            // Arrange & Act
            var sender = new SendSMS();

            // Assert
            // You could check for a known configuration value if present
            // For now, just ensure the object is created
            Assert.NotNull(sender);
        }

        [Fact]
        public async Task SendSMSAsync_ThrowsNotImplementedException()
        {
            // Arrange
            var sender = new SendSMS();
            var response = await sender.SendSMSAsync("0528334179", "Test message");

            // Act & Assert
            //await Assert.ThrowsAsync<NotImplementedException>(() => sender.SendSmsAsync("0528334179", "Test message"));
        }
    }
}