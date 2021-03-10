using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Identity.Resources
{
    public interface IPersistedGrantAspNetIdentityServiceResources
    {
        ResourceMessage PersistedGrantDoesNotExist();

        ResourceMessage PersistedGrantWithSubjectIdDoesNotExist();
    }
}
