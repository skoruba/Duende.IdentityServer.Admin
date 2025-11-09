using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Identity
{
    public class OTPConfiguration
    {
        public int Digits { get; set; } = 6;
        public int Expiry { get; set; } = 5;
        public string[] Groups { get; set; } = Array.Empty<string>();
    }
}
