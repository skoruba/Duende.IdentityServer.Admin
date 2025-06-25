

using SMSSender;
using System.Text;
using System.Xml.Linq;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Web;

namespace SMSSenderInforU
{
    public class SendSMS : ISMSSender
    {
        private readonly IConfiguration _configuration;

        public SendSMS()
        {
            _configuration = new ConfigurationBuilder()
           .SetBasePath(AppContext.BaseDirectory) // or other path
           .AddXmlFile("SMSSender.xml", optional: false, reloadOnChange: true)
           .Build();
        }



        static async Task<string> PostDataToUrlAsync(string url, string data)
        {
            try
            {
                using var httpClient = new HttpClient
                {
                    Timeout = TimeSpan.FromSeconds(30)
                };

                // Optional: emulate application/x-www-form-urlencoded manually
                var content = new StringContent(data.Replace(" ", "+"), Encoding.UTF8, "application/x-www-form-urlencoded");

                using var response = await httpClient.PostAsync(url, content);

                response.EnsureSuccessStatusCode(); // Throws if not 2xx

                return await response.Content.ReadAsStringAsync();
            }
            catch (HttpRequestException ex)
            {
                return $"HTTP Error: {ex.Message}";
            }
            catch (TaskCanceledException)
            {
                return "Request timed out.";
            }
            catch (Exception ex)
            {
                return $"Unexpected Error: {ex}";
            }
        }


        public async Task<String> SendSMSAsync(string number, string message)
        {
            var xmlFilePath = Path.Combine(AppContext.BaseDirectory, "SMSSender.xml");
            var doc = XDocument.Load(xmlFilePath);
            var url = doc.Root?.Element("CustomerSettings")?.Element("url")?.Value;
            var messageElement = doc.Root?.Element("CustomerSettings")?
                                     .Element("Inforu")?
                                     .Element("Content")?
                                     .Element("Message");

            if (messageElement == null)
            {
                throw new InvalidOperationException("<Message> element not found.");
            }

            var template = messageElement.Value;
            var formattedMessage = string.Format(template, message);
            messageElement.Value = formattedMessage;

            var phoneElement = doc.Root?
                .Element("CustomerSettings")?
                .Element("Inforu")?
                .Element("Recipients")?
                .Element("PhoneNumber");

            if (phoneElement == null)
            {
                throw new InvalidOperationException("<PhoneNumber> element not found.");
            }

            phoneElement.Value = number;


            var inforu = doc.Root?
                                 .Element("CustomerSettings")?
                                 .Element("Inforu");

            if (inforu == null)
            {
                throw new InvalidOperationException("<Inforu> element not found.");
            }

            var inforuXml = inforu.ToString(SaveOptions.DisableFormatting);

            var xml = HttpUtility.UrlEncode(inforuXml, System.Text.Encoding.UTF8);

            var response = await PostDataToUrlAsync(url, "InforuXML=" + xml);

            return response;
        }
    }
}
