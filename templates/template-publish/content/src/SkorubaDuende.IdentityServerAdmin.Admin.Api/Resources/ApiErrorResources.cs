using SkorubaDuende.IdentityServerAdmin.Admin.Api.ExceptionHandling;

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Resources
{
    public class ApiErrorResources : IApiErrorResources
    {
        public virtual ApiError CannotSetId()
        {
            return new ApiError
            {
                Code = nameof(CannotSetId),
                Description = ApiErrorResource.CannotSetId
            };
        }
    }
}







