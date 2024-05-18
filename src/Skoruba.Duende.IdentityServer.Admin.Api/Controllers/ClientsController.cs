// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.Api.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.Api.Dtos.Clients;
using Skoruba.Duende.IdentityServer.Admin.Api.ExceptionHandling;
using Skoruba.Duende.IdentityServer.Admin.Api.Mappers;
using Skoruba.Duende.IdentityServer.Admin.Api.Resources;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Shared.Dtos.Common;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [TypeFilter(typeof(ControllerExceptionFilterAttribute))]
    [Produces("application/json", "application/problem+json")]
    [Authorize(Policy = AuthorizationConsts.AdministrationPolicy)]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly IApiErrorResources _errorResources;

        public ClientsController(IClientService clientService, IApiErrorResources errorResources)
        {
            _clientService = clientService;
            _errorResources = errorResources;
        }

        [HttpGet]
        public async Task<ActionResult<ClientsApiDto>> Get(string searchText, int page = 1, int pageSize = 10)
        {
            var clientsDto = await _clientService.GetClientsAsync(searchText, page, pageSize);
            var clientsApiDto = clientsDto.ToClientApiModel<ClientsApiDto>();

            return Ok(clientsApiDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ClientApiDto>> Get(int id)
        {
            var clientDto = await _clientService.GetClientAsync(id);
            var clientApiDto = clientDto.ToClientApiModel<ClientApiDto>();

            return Ok(clientApiDto);
        }

        [HttpGet(nameof(GetAccessTokenTypes))]
        public ActionResult<List<SelectItemDto>> GetAccessTokenTypes()
        {
            var accessTokenTypes = _clientService.GetAccessTokenTypes();

            return accessTokenTypes;
        }
        
        [HttpGet(nameof(GetTokenExpirations))]
        public ActionResult<List<SelectItemDto>> GetTokenExpirations()
        {
            var tokenExpirations = _clientService.GetTokenExpirations();

            return tokenExpirations;
        }
        
        [HttpGet(nameof(GetTokenUsage))]
        public ActionResult<List<SelectItemDto>> GetTokenUsage()
        {
            var tokenUsage = _clientService.GetTokenUsage();

            return tokenUsage;
        }
        
        [HttpGet(nameof(GetProtocolTypes))]
        public ActionResult<List<SelectItemDto>> GetProtocolTypes()
        {
            var protocolTypes = _clientService.GetProtocolTypes();

            return protocolTypes;
        }
        
        [HttpGet(nameof(GetDPoPValidationModes))]
        public ActionResult<List<SelectItemDto>> GetDPoPValidationModes()
        {
            var dPoPValidationModes = _clientService.GetDPoPValidationModes();

            return dPoPValidationModes;
        }
        
        [HttpGet(nameof(GetScopes))]
        public async Task<ActionResult<List<string>>> GetScopes(string scope, int limit = 0)
        {
            var scopes = await _clientService.GetScopesAsync(scope, limit);

            return scopes;
        }
        
        [HttpGet(nameof(GetGrantTypes))]
        public ActionResult<List<SelectItemDto>> GetGrantTypes(string grant, bool includeObsoleteGrants, int limit = 0)
        {
            var grants = _clientService.GetGrantTypes(grant, includeObsoleteGrants, limit);

            return grants;
        }
        
        [HttpGet(nameof(GetHashTypes))]
        public ActionResult<List<SelectItemDto>> GetHashTypes()
        {
            var hashTypes = _clientService.GetHashTypes();

            return hashTypes;
        }
        
        [HttpGet(nameof(GetSecretTypes))]
        public ActionResult<List<SelectItemDto>> GetSecretTypes()
        {
            var secretTypes = _clientService.GetSecretTypes();

            return secretTypes;
        }
        
        [HttpGet(nameof(GetStandardClaims))]
        public ActionResult<List<string>> GetStandardClaims(string claim, int limit = 0)
        {
            var standardClaims = _clientService.GetStandardClaims(claim, limit);

            return standardClaims;
        }
        
        [HttpGet(nameof(GetSigningAlgorithms))]
        public ActionResult<List<string>> GetSigningAlgorithms(string algorithm, int limit = 0)
        {
            var signingAlgorithms = _clientService.GetSigningAlgorithms(algorithm, limit);

            return signingAlgorithms;
        }
        
        [HttpGet(nameof(CanInsertClient))]
        public async Task<ActionResult<bool>> CanInsertClient(int id, string clientId, bool isCloned)
        {
            var clientExists = await _clientService.CanInsertClientAsync(new ClientDto()
            {
               Id = id,
               ClientId = clientId,
            }, isCloned);

            return clientExists;
        }
      
        [HttpPost]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Post([FromBody]ClientApiDto client)
        {
            var clientDto = client.ToClientApiModel<ClientDto>();

            if (!clientDto.Id.Equals(default))
            {
                return BadRequest(_errorResources.CannotSetId());
            }

            var id = await _clientService.AddClientAsync(clientDto);
            client.Id = id;

            return CreatedAtAction(nameof(Get), new { id }, client);
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody]ClientApiDto client)
        {
            var clientDto = client.ToClientApiModel<ClientDto>();

            await _clientService.GetClientAsync(clientDto.Id);
            await _clientService.UpdateClientAsync(clientDto, updateClientClaims: true, updateClientProperties: true);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var clientDto = new ClientDto { Id = id };

            await _clientService.GetClientAsync(clientDto.Id);
            await _clientService.RemoveClientAsync(clientDto);

            return Ok();
        }

        [HttpPost("Clone")]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> PostClientClone([FromBody]ClientCloneApiDto client)
        {
            var clientCloneDto = client.ToClientApiModel<ClientCloneDto>();

            var originalClient = await _clientService.GetClientAsync(clientCloneDto.Id);
            var id = await _clientService.CloneClientAsync(clientCloneDto);
            originalClient.Id = id;

            return CreatedAtAction(nameof(Get), new { id }, originalClient);
        }

        [HttpGet("{id}/Secrets")]
        public async Task<ActionResult<ClientSecretsApiDto>> GetSecrets(int id, int page = 1, int pageSize = 10)
        {
            var clientSecretsDto = await _clientService.GetClientSecretsAsync(id, page, pageSize);
            var clientSecretsApiDto = clientSecretsDto.ToClientApiModel<ClientSecretsApiDto>();

            return Ok(clientSecretsApiDto);
        }

        [HttpGet("Secrets/{secretId}")]
        public async Task<ActionResult<ClientSecretApiDto>> GetSecret(int secretId)
        {
            var clientSecretsDto = await _clientService.GetClientSecretAsync(secretId);
            var clientSecretDto = clientSecretsDto.ToClientApiModel<ClientSecretApiDto>();

            return Ok(clientSecretDto);
        }

        [HttpPost("{id}/Secrets")]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> PostSecret(int id, [FromBody]ClientSecretApiDto clientSecretApi)
        {
            var secretsDto = clientSecretApi.ToClientApiModel<ClientSecretsDto>();
            secretsDto.ClientId = id;

            if (!secretsDto.ClientSecretId.Equals(default))
            {
                return BadRequest(_errorResources.CannotSetId());
            }

            var secretId = await _clientService.AddClientSecretAsync(secretsDto);
            clientSecretApi.Id = secretId;

            return CreatedAtAction(nameof(GetSecret), new { secretId }, clientSecretApi);
        }

        [HttpDelete("Secrets/{secretId}")]
        public async Task<IActionResult> DeleteSecret(int secretId)
        {
            var clientSecret = new ClientSecretsDto { ClientSecretId = secretId };

            await _clientService.GetClientSecretAsync(clientSecret.ClientSecretId);
            await _clientService.DeleteClientSecretAsync(clientSecret);

            return Ok();
        }

        [HttpGet("{id}/Properties")]
        public async Task<ActionResult<ClientPropertiesApiDto>> GetProperties(int id, int page = 1, int pageSize = 10)
        {
            var clientPropertiesDto = await _clientService.GetClientPropertiesAsync(id, page, pageSize);
            var clientPropertiesApiDto = clientPropertiesDto.ToClientApiModel<ClientPropertiesApiDto>();

            return Ok(clientPropertiesApiDto);
        }

        [HttpGet("Properties/{propertyId}")]
        public async Task<ActionResult<ClientPropertyApiDto>> GetProperty(int propertyId)
        {
            var clientPropertiesDto = await _clientService.GetClientPropertyAsync(propertyId);
            var clientPropertyApiDto = clientPropertiesDto.ToClientApiModel<ClientPropertyApiDto>();

            return Ok(clientPropertyApiDto);
        }

        [HttpPost("{id}/Properties")]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> PostProperty(int id, [FromBody]ClientPropertyApiDto clientPropertyApi)
        {
            var clientPropertiesDto = clientPropertyApi.ToClientApiModel<ClientPropertiesDto>();
            clientPropertiesDto.ClientId = id;

            if (!clientPropertiesDto.ClientPropertyId.Equals(default))
            {
                return BadRequest(_errorResources.CannotSetId());
            }

            var propertyId = await _clientService.AddClientPropertyAsync(clientPropertiesDto);
            clientPropertyApi.Id = propertyId;

            return CreatedAtAction(nameof(GetProperty), new { propertyId }, clientPropertyApi);
        }

        [HttpDelete("Properties/{propertyId}")]
        public async Task<IActionResult> DeleteProperty(int propertyId)
        {
            var clientProperty = new ClientPropertiesDto { ClientPropertyId = propertyId };

            await _clientService.GetClientPropertyAsync(clientProperty.ClientPropertyId);
            await _clientService.DeleteClientPropertyAsync(clientProperty);

            return Ok();
        }

        [HttpGet("{id}/Claims")]
        public async Task<ActionResult<ClientClaimsApiDto>> GetClaims(int id, int page = 1, int pageSize = 10)
        {
            var clientClaimsDto = await _clientService.GetClientClaimsAsync(id, page, pageSize);
            var clientClaimsApiDto = clientClaimsDto.ToClientApiModel<ClientClaimsApiDto>();

            return Ok(clientClaimsApiDto);
        }

        [HttpGet("Claims/{claimId}")]
        public async Task<ActionResult<ClientClaimApiDto>> GetClaim(int claimId)
        {
            var clientClaimsDto = await _clientService.GetClientClaimAsync(claimId);
            var clientClaimApiDto = clientClaimsDto.ToClientApiModel<ClientClaimApiDto>();

            return Ok(clientClaimApiDto);
        }

        [HttpPost("{id}/Claims")]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> PostClaim(int id, [FromBody]ClientClaimApiDto clientClaimApiDto)
        {
            var clientClaimsDto = clientClaimApiDto.ToClientApiModel<ClientClaimsDto>();
            clientClaimsDto.ClientId = id;

            if (!clientClaimsDto.ClientClaimId.Equals(default))
            {
                return BadRequest(_errorResources.CannotSetId());
            }

            var claimId = await _clientService.AddClientClaimAsync(clientClaimsDto);
            clientClaimApiDto.Id = claimId;

            return CreatedAtAction(nameof(GetClaim), new { claimId }, clientClaimApiDto);
        }

        [HttpDelete("Claims/{claimId}")]
        public async Task<IActionResult> DeleteClaim(int claimId)
        {
            var clientClaimsDto = new ClientClaimsDto { ClientClaimId = claimId };

            await _clientService.GetClientClaimAsync(claimId);
            await _clientService.DeleteClientClaimAsync(clientClaimsDto);

            return Ok();
        }
    }
}