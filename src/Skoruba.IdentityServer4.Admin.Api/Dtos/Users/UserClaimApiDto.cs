using System.ComponentModel.DataAnnotations;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Users
{
    public class UserClaimApiDto<TKey>
    {
        public int ClaimId { get; set; }

        public TKey UserId { get; set; }

        [Required]
        public string ClaimType { get; set; }

        [Required]
        public string ClaimValue { get; set; }
    }
}