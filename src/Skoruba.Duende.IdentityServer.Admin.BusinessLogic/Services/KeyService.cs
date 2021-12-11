// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Threading;
using System.Threading.Tasks;
using Skoruba.AuditLogging.Services;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Grant;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Key;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Events.Key;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Mappers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Resources;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared.ExceptionHandling;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Repositories.Interfaces;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services
{
    public class KeyService : IKeyService
    {
        protected readonly IKeyRepository KeyRepository;
        protected readonly IAuditEventLogger AuditEventLogger;
        protected readonly IKeyServiceResources KeyServiceResources;

        public KeyService(IKeyRepository keyRepository, IAuditEventLogger auditEventLogger, IKeyServiceResources keyServiceResources)
        {
            KeyRepository = keyRepository;
            AuditEventLogger = auditEventLogger;
            KeyServiceResources = keyServiceResources;
        }

        public async Task<KeysDto> GetKeysAsync(int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
        {
            var keys = await KeyRepository.GetKeysAsync(page, pageSize, cancellationToken);

            var keysDto = keys.ToModel();

            await AuditEventLogger.LogEventAsync(new KeysRequestedEvent(keysDto));

            return keysDto;
        }

        public async Task<KeyDto> GetKeyAsync(string id, CancellationToken cancellationToken = default)
        {
            var key = await KeyRepository.GetKeyAsync(id, cancellationToken);

            if (key == default)
            {
                throw new UserFriendlyErrorPageException(string.Format(KeyServiceResources.KeyDoesNotExist().Description, id));
            }

            var keyDto = key.ToModel();

            await AuditEventLogger.LogEventAsync(new KeyRequestedEvent(keyDto));

            return keyDto;
        }

        public Task<bool> ExistsKeyAsync(string id, CancellationToken cancellationToken = default)
        {
            return KeyRepository.ExistsKeyAsync(id, cancellationToken);
        }

        public async Task DeleteKeyAsync(string id, CancellationToken cancellationToken = default)
        {
            var key = await GetKeyAsync(id, cancellationToken);

            await AuditEventLogger.LogEventAsync(new KeyDeletedEvent(key));

            await KeyRepository.DeleteKeyAsync(id, cancellationToken);
        }
    }
}