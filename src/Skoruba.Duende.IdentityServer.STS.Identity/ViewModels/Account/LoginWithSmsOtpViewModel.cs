using System.ComponentModel.DataAnnotations;

namespace Skoruba.Duende.IdentityServer.STS.Identity.ViewModels.Account
{
    public class LoginWithSmsOtpViewModel
    {
        [Required]
        [StringLength(6, ErrorMessage = "The {0} must be exactly {1} characters long.", MinimumLength = 6)]
        [DataType(DataType.Text)]
        public string OtpCode { get; set; }
        
        public bool RememberMe { get; set; }
        public string ReturnUrl { get; set; }
        public string PhoneNumber { get; set; }
    }
}

