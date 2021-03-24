// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Resources
{
    public class ApiScopeServiceResources : IApiScopeServiceResources
    {
        public virtual ResourceMessage ApiScopeDoesNotExist()
        {
            return new ResourceMessage()
            {
                Code = nameof(ApiScopeDoesNotExist),
                Description = ApiScopeServiceResource.ApiScopeDoesNotExist
            };
        }

        public virtual ResourceMessage ApiScopeExistsValue()
        {
            return new ResourceMessage()
            {
                Code = nameof(ApiScopeExistsValue),
                Description = ApiScopeServiceResource.ApiScopeExistsValue
            };
        }

        public virtual ResourceMessage ApiScopeExistsKey()
        {
            return new ResourceMessage()
            {
                Code = nameof(ApiScopeExistsKey),
                Description = ApiScopeServiceResource.ApiScopeExistsKey
            };
        }

        public ResourceMessage ApiScopePropertyExistsValue()
        {
            return new ResourceMessage()
            {
                Code = nameof(ApiScopePropertyExistsValue),
                Description = ApiScopeServiceResource.ApiScopePropertyExistsValue
            };
        }

        public ResourceMessage ApiScopePropertyDoesNotExist()
        {
            return new ResourceMessage()
            {
                Code = nameof(ApiScopePropertyDoesNotExist),
                Description = ApiScopeServiceResource.ApiScopePropertyDoesNotExist
            };
        }

        public ResourceMessage ApiScopePropertyExistsKey()
        {
            return new ResourceMessage()
            {
                Code = nameof(ApiScopePropertyExistsKey),
                Description = ApiScopeServiceResource.ApiScopePropertyExistsKey
            };
        }
    }
}