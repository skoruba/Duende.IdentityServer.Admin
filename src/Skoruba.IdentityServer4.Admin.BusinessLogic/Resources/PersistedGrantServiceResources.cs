using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Helpers;
using Skoruba.IdentityServer4.Admin.BusinessLogic.Resources;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Resources
{
    public class PersistedGrantServiceResources : IPersistedGrantServiceResources
    {
        public virtual ResourceMessage PersistedGrantDoesNotExist()
        {
            return new ResourceMessage()
            {
                Code = nameof(PersistedGrantDoesNotExist),
                Description = PersistedGrantServiceResource.PersistedGrantDoesNotExist
            };
        }

        public virtual ResourceMessage PersistedGrantWithSubjectIdDoesNotExist()
        {
            return new ResourceMessage()
            {
                Code = nameof(PersistedGrantWithSubjectIdDoesNotExist),
                Description = PersistedGrantServiceResource.PersistedGrantWithSubjectIdDoesNotExist
            };
        }
    }
}
