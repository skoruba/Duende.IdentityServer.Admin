using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Configuration.Configuration.Identity
{
    public class Role
    {
        public string Name { get; set; }
        public List<Claim> Claims { get; set; } = new List<Claim>();
    }
}
