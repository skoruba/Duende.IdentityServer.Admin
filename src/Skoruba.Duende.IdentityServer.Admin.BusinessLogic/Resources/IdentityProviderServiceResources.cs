// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Resources
{
    public class IdentityProviderServiceResources : IIdentityProviderServiceResources
    {
        public virtual ResourceMessage IdentityProviderDoesNotExist()
        {
            return new ResourceMessage()
            {
                Code = nameof(IdentityProviderDoesNotExist),
                Description = IdentityProviderServiceResource.IdentityProviderDoesNotExist
            };
        }

        public virtual ResourceMessage IdentityProviderExistsKey()
        {
            return new ResourceMessage()
            {
                Code = nameof(IdentityProviderExistsKey),
                Description = IdentityProviderServiceResource.IdentityProviderExistsKey
            };
        }

        public virtual ResourceMessage IdentityProviderExistsValue()
        {
            return new ResourceMessage()
            {
                Code = nameof(IdentityProviderExistsValue),
                Description = IdentityProviderServiceResource.IdentityProviderExistsValue
            };
        }
        
    }
}
