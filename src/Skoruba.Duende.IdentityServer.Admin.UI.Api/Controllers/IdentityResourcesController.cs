// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Clients;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.IdentityResources;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.ExceptionHandling;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Mappers;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Resources;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [TypeFilter(typeof(ControllerExceptionFilterAttribute))]
    [Produces("application/json", "application/problem+json")]
    [Authorize(Policy = AuthorizationConsts.AdministrationPolicy)]
    public class IdentityResourcesController : ControllerBase
    {
        private readonly IIdentityResourceService _identityResourceService;
        private readonly IApiErrorResources _errorResources;
        private readonly IClientService _clientService;

        public IdentityResourcesController(IIdentityResourceService identityResourceService, IApiErrorResources errorResources,
            IClientService clientService)
        {
            _identityResourceService = identityResourceService;
            _errorResources = errorResources;
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<ActionResult<IdentityResourcesApiDto>> Get(string searchText, int page = 1, int pageSize = 10)
        {
            var identityResourcesDto = await _identityResourceService.GetIdentityResourcesAsync(searchText, page, pageSize);
            var identityResourcesApiDto = identityResourcesDto.ToIdentityResourcesApiDto();

            return Ok(identityResourcesApiDto);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IdentityResourceApiDto>> Get(int id)
        {
            var identityResourceDto = await _identityResourceService.GetIdentityResourceAsync(id);
            var identityResourceApiModel = identityResourceDto.ToIdentityResourceApiDto();

            return Ok(identityResourceApiModel);
        }

        [HttpGet(nameof(CanInsertIdentityResource))]
        public async Task<ActionResult<bool>> CanInsertIdentityResource(int id, string name)
        {
            var exists = await _identityResourceService.CanInsertIdentityResourceAsync(new IdentityResourceDto
            {
                Id = id,
                Name = name
            });

            return exists;
        }

        [HttpGet(nameof(CanInsertIdentityResourceProperty))]
        public async Task<ActionResult<bool>> CanInsertIdentityResourceProperty(int id, string key)
        {
            var exists = await _identityResourceService.CanInsertIdentityResourcePropertyAsync(new IdentityResourcePropertiesDto()
            {
                IdentityResourceId = id,
                Key = key
            });

            return exists;
        }

        [HttpPost]
        [ProducesResponseType(typeof(IdentityResourceApiDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<IdentityResourceApiDto>> Post([FromBody] IdentityResourceApiDto identityResourceApi)
        {
            var identityResourceDto = identityResourceApi.ToIdentityResourceDto();

            if (!identityResourceDto.Id.Equals(default))
            {
                return BadRequest(_errorResources.CannotSetId());
            }

            var id = await _identityResourceService.AddIdentityResourceAsync(identityResourceDto);
            identityResourceApi.Id = id;

            return CreatedAtAction(nameof(Get), new { id }, identityResourceApi);
        }

        [HttpPut]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Put([FromBody] IdentityResourceApiDto identityResourceApi)
        {
            var identityResource = identityResourceApi.ToIdentityResourceDto();

            await _identityResourceService.GetIdentityResourceAsync(identityResource.Id);
            await _identityResourceService.UpdateIdentityResourceAsync(identityResource);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            var identityResource = new IdentityResourceDto { Id = id };

            await _identityResourceService.GetIdentityResourceAsync(identityResource.Id);
            await _identityResourceService.DeleteIdentityResourceAsync(identityResource);

            return NoContent();
        }

        [HttpGet("{id}/Properties")]
        public async Task<ActionResult<IdentityResourcePropertiesApiDto>> GetProperties(int id, int page = 1, int pageSize = 10)
        {
            var identityResourcePropertiesDto = await _identityResourceService.GetIdentityResourcePropertiesAsync(id, page, pageSize);
            var identityResourcePropertiesApiDto = identityResourcePropertiesDto.ToIdentityResourcePropertiesApiDto();

            return Ok(identityResourcePropertiesApiDto);
        }

        [HttpGet("{id}/Clients")]
        public async Task<ActionResult<ClientsApiDto>> GetClients(int id, int page = 1, int pageSize = 10)
        {
            var identityResourceDto = await _identityResourceService.GetIdentityResourceAsync(id);
            var clientsDto = await _clientService.GetClientsByScopeAsync(identityResourceDto.Name, page, pageSize);
            var clientsApiDto = clientsDto.ToClientsApiDto();

            return Ok(clientsApiDto);
        }

        [HttpGet("Properties/{propertyId}")]
        public async Task<ActionResult<IdentityResourcePropertyApiDto>> GetProperty(int propertyId)
        {
            var identityResourcePropertiesDto = await _identityResourceService.GetIdentityResourcePropertyAsync(propertyId);
            var identityResourcePropertyApiDto = identityResourcePropertiesDto.ToIdentityResourcePropertyApiDto();

            return Ok(identityResourcePropertyApiDto);
        }

        [HttpPost("{id}/Properties")]
        [ProducesResponseType(typeof(IdentityResourcePropertyApiDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<IdentityResourcePropertyApiDto>> PostProperty(int id, [FromBody] IdentityResourcePropertyApiDto identityResourcePropertyApi)
        {
            var identityResourcePropertiesDto = identityResourcePropertyApi.ToIdentityResourcePropertiesDto();
            identityResourcePropertiesDto.IdentityResourceId = id;

            if (!identityResourcePropertiesDto.IdentityResourcePropertyId.Equals(default))
            {
                return BadRequest(_errorResources.CannotSetId());
            }

            var propertyId = await _identityResourceService.AddIdentityResourcePropertyAsync(identityResourcePropertiesDto);
            identityResourcePropertyApi.Id = propertyId;

            return CreatedAtAction(nameof(GetProperty), new { propertyId }, identityResourcePropertyApi);
        }

        [HttpDelete("Properties/{propertyId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteProperty(int propertyId)
        {
            var identityResourceProperty = new IdentityResourcePropertiesDto { IdentityResourcePropertyId = propertyId };

            await _identityResourceService.GetIdentityResourcePropertyAsync(identityResourceProperty.IdentityResourcePropertyId);
            await _identityResourceService.DeleteIdentityResourcePropertyAsync(identityResourceProperty);

            return NoContent();
        }
    }
}