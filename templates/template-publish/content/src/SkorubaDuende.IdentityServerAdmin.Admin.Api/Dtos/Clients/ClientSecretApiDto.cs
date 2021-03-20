using System;
using System.ComponentModel.DataAnnotations;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Helpers;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Dtos.Clients
{
    public class ClientSecretApiDto
    {
        [Required]
        public string Type { get; set; } = "SharedSecret";

        public int Id { get; set; }

        public string Description { get; set; }

        [Required]
        public string Value { get; set; }

        public string HashType { get; set; }

        public HashType HashTypeEnum
        {
            get
            {
                HashType result;

                if (Enum.TryParse(HashType, true, out result))
                {
                    return result;
                }

                return Skoruba.Duende.IdentityServer.Admin.EntityFramework.Helpers.HashType.Sha256;
            }
        }

        public DateTime? Expiration { get; set; }
    }
}







