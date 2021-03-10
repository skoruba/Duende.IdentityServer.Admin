using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared.Dtos.Common;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration
{
	public class ApiSecretsDto
	{
		public ApiSecretsDto()
		{
			ApiSecrets = new List<ApiSecretDto>();
		}

		public int ApiResourceId { get; set; }

		public int ApiSecretId { get; set; }

	    public string ApiResourceName { get; set; }

        [Required]
		public string Type { get; set; } = "SharedSecret";

	    public List<SelectItemDto> TypeList { get; set; }

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

                return Duende.IdentityServer.Admin.EntityFramework.Helpers.HashType.Sha256;
            }
        }

		public List<SelectItemDto> HashTypes { get; set; }

		public DateTime? Expiration { get; set; }

		public int TotalCount { get; set; }

		public int PageSize { get; set; }

		public List<ApiSecretDto> ApiSecrets { get; set; }
	}
}