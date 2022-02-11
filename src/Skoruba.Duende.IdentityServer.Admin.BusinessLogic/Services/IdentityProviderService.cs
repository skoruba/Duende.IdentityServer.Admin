// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Duende.IdentityServer.EntityFramework.Entities;
using Microsoft.EntityFrameworkCore;
using Skoruba.AuditLogging.Services;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Helpers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Resources;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared.ExceptionHandling;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Extensions.Common;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services
{
    public class IdentityProviderService : IIdentityProviderService
    {
        protected readonly IIdentityProviderRepository IdentityProviderRepository;
        protected readonly IIdentityProviderServiceResources IdentityProviderServiceResources;
        protected readonly IAuditEventLogger AuditEventLogger;

        public IdentityProviderService(IIdentityProviderRepository identityProviderRepository,
            IIdentityProviderServiceResources identityProviderServiceResources,
            IAuditEventLogger auditEventLogger)
        {
            IdentityProviderRepository = identityProviderRepository;
            IdentityProviderServiceResources = identityProviderServiceResources;
            AuditEventLogger = auditEventLogger;
        }

        public virtual async Task<IdentityProvidersDto> GetIdentityProvidersAsync(string search, int page = 1, int pageSize = 10)
        {
            var pagedList = await IdentityProviderRepository.GetIdentityProvidersAsync(search, page, pageSize);
            var identityProviderDto = pagedList.ToModel();

            await AuditEventLogger.LogEventAsync(new IdentityProvidersRequestedEvent(identityProviderDto));

            return identityProviderDto;
        }

        public virtual async Task<IdentityProviderDto> GetIdentityProviderAsync(int identityProviderId)
        {
            var identityProvider = await IdentityProviderRepository.GetIdentityProviderAsync(identityProviderId);
            if (identityProvider == null) throw new UserFriendlyErrorPageException(string.Format(IdentityProviderServiceResources.IdentityProviderDoesNotExist().Description, identityProviderId));

            var identityProviderDto = identityProvider.ToModel();

            await AuditEventLogger.LogEventAsync(new IdentityProviderRequestedEvent(identityProviderDto));

            return identityProviderDto;
        }
        
        public virtual async Task<bool> CanInsertIdentityProviderAsync(IdentityProviderDto identityProvider)
        {
            var entity = identityProvider.ToEntity();

            return await IdentityProviderRepository.CanInsertIdentityProviderAsync(entity);
        }

        public virtual async Task<int> AddIdentityProviderAsync(IdentityProviderDto identityProvider)
        {
            var canInsert = await CanInsertIdentityProviderAsync(identityProvider);
            if (!canInsert)
            {
                throw new UserFriendlyViewException(string.Format(IdentityProviderServiceResources.IdentityProviderExistsValue().Description, identityProvider.Scheme), IdentityProviderServiceResources.IdentityProviderExistsKey().Description, identityProvider);
            }

            var entity = identityProvider.ToEntity();

            var saved = await IdentityProviderRepository.AddIdentityProviderAsync(entity);

            await AuditEventLogger.LogEventAsync(new IdentityProviderAddedEvent(identityProvider));

            return saved;
        }

        public virtual async Task<int> UpdateIdentityProviderAsync(IdentityProviderDto identityProvider)
        {
            var canInsert = await CanInsertIdentityProviderAsync(identityProvider);
            if (!canInsert)
            {
                throw new UserFriendlyViewException(string.Format(IdentityProviderServiceResources.IdentityProviderExistsValue().Description, identityProvider.Scheme), IdentityProviderServiceResources.IdentityProviderExistsKey().Description, identityProvider);
            }

            var originalIdentityProvider = await GetIdentityProviderAsync(identityProvider.Id);

            if (identityProvider.IdentityProviderProperties == null)
            {
                identityProvider.IdentityProviderProperties = new Dictionary<string, string>(originalIdentityProvider.IdentityProviderProperties);
            }

            var entity = identityProvider.ToEntity();

            var updated = await IdentityProviderRepository.UpdateIdentityProviderAsync(entity);
            
            await AuditEventLogger.LogEventAsync(new IdentityProviderUpdatedEvent(originalIdentityProvider, identityProvider));

            return updated;
        }

        public virtual async Task<int> DeleteIdentityProviderAsync(IdentityProviderDto identityProvider)
        {
            var entity = identityProvider.ToEntity();

            var deleted = await IdentityProviderRepository.DeleteIdentityProviderAsync(entity);

            await AuditEventLogger.LogEventAsync(new IdentityProviderDeletedEvent(identityProvider));

            return deleted;
        }


#warning TODO

        public virtual IdentityProviderDto BuildIdentityProviderViewModel(IdentityProviderDto identityProvider)
        {
            //TODO: make similar:
            //ComboBoxHelpers.PopulateValuesToList(identityResource.UserClaimsItems, identityResource.UserClaims);

            return identityProvider;
        }

        public async Task<IdentityProviderPropertiesDto> GetIdentityProviderPropertiesAsync(int identityProviderId, int page = 1, int pageSize = 10)
        {
            var identityProvider = await IdentityProviderRepository.GetIdentityProviderAsync(identityProviderId);
            if (identityProvider.Scheme == null) throw new UserFriendlyErrorPageException(string.Format(IdentityProviderServiceResources.IdentityProviderDoesNotExist().Description, identityProviderId));
            
            var identityProviderPropertiesDto = Map(identityProvider, (page - 1) * pageSize, pageSize);

            return identityProviderPropertiesDto;

        }

        private IdentityProviderPropertiesDto Map(IdentityProvider identityProvider, int skip = 0, int take = 10, string key = null)
        {
            var props = JsonSerializer.Deserialize<Dictionary<string, string>>(identityProvider.Properties ?? "{}");
            props.TryGetValue(key ?? "", out var value);

            var result = new IdentityProviderPropertiesDto
            {
                Key = key, //nothing selected yet
                Value = value,
                PageSize = 10,
                TotalCount = props.Count,
                IdentityProviderProperties = props.Skip(skip).Take(take).Select(p =>
                    new IdentityProviderPropertyDto { Id = p.Key, Key = p.Key, Value = p.Value }).ToList(),
                IdentityProviderId = identityProvider.Id,
                IdentityProviderScheme = identityProvider.Scheme
            };

            return result;
        }

        public async Task<IdentityProviderPropertiesDto> GetIdentityProviderPropertyAsync(int identityProviderId, string key)
        {
            var identityProvider = await IdentityProviderRepository.GetIdentityProviderAsync(identityProviderId);
            if (identityProvider.Scheme == null) throw new UserFriendlyErrorPageException(string.Format(IdentityProviderServiceResources.IdentityProviderDoesNotExist().Description, identityProviderId));

            var identityProviderPropertiesDto = Map(identityProvider, key:key); //?

            return identityProviderPropertiesDto;
        }

        public async Task<int> AddIdentityProviderPropertyAsync(IdentityProviderPropertiesDto identityProviderProperties)
        {
            var identityProviderId = identityProviderProperties.IdentityProviderId;
            var identityProvider = await IdentityProviderRepository.GetIdentityProviderAsync(identityProviderId);
            if (identityProvider.Scheme == null) throw new UserFriendlyErrorPageException(string.Format(IdentityProviderServiceResources.IdentityProviderDoesNotExist().Description, identityProviderId));

            var props = JsonSerializer.Deserialize<Dictionary<string, string>>(identityProvider.Properties ?? "{}") ?? new Dictionary<string, string>();
            if (!props.TryAdd(identityProviderProperties.Key, identityProviderProperties.Value))
            {
                //error
                throw new UserFriendlyErrorPageException(string.Format(IdentityProviderServiceResources.IdentityProviderPropertyExistsKey().Description, identityProviderProperties.Key));
            }
            else
            {
                identityProvider.Properties = JsonSerializer.Serialize(props);
                return await UpdateIdentityProviderAsync(identityProvider.ToModel());
            }
        }

        public async Task<int> DeleteIdentityProviderPropertyAsync(IdentityProviderPropertiesDto identityProviderProperties)
        {
            var identityProviderId = identityProviderProperties.IdentityProviderId;
            var identityProvider = await IdentityProviderRepository.GetIdentityProviderAsync(identityProviderId);
            if (identityProvider.Scheme == null) throw new UserFriendlyErrorPageException(string.Format(IdentityProviderServiceResources.IdentityProviderDoesNotExist().Description, identityProviderId));

            var props = JsonSerializer.Deserialize<Dictionary<string, string>>(identityProvider.Properties ?? "{}") ?? new Dictionary<string, string>();
            props.Remove(identityProviderProperties.Key, out var value);

            identityProvider.Properties = JsonSerializer.Serialize(props);
            return await UpdateIdentityProviderAsync(identityProvider.ToModel());
        }
    }
}
