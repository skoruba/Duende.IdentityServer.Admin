// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Configuration;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.ApiResources;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.ApiScopes;
using Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Clients;
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
    public class ApiScopesController : ControllerBase
    {
        private readonly IApiErrorResources _errorResources;
        private readonly IApiScopeService _apiScopeService;
        private readonly IClientService _clientService;
        private readonly IApiResourceService _apiResourceService;

        public ApiScopesController(IApiErrorResources errorResources, IApiScopeService apiScopeService,
            IClientService clientService, IApiResourceService apiResourceService)
        {
            _errorResources = errorResources;
            _apiScopeService = apiScopeService;
            _clientService = clientService;
            _apiResourceService = apiResourceService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiScopesApiDto>> GetScopes(string search, int page = 1, int pageSize = 10)
        {
            var apiScopesDto = await _apiScopeService.GetApiScopesAsync(search, page, pageSize);
            var apiScopesApiDto = apiScopesDto.ToApiScopesApiDto();

            return Ok(apiScopesApiDto);
        }

        [HttpGet(nameof(CanInsertApiScope))]
        public async Task<ActionResult<bool>> CanInsertApiScope(int id, string name)
        {
            var exists = await _apiScopeService.CanInsertApiScopeAsync(new ApiScopeDto()
            {
                Id = id,
                Name = name
            });

            return Ok(exists);
        }

        [HttpGet(nameof(CanInsertApiScopeProperty))]
        public async Task<ActionResult<bool>> CanInsertApiScopeProperty(int id, string key)
        {
            var exists = await _apiScopeService.CanInsertApiScopePropertyAsync(new ApiScopePropertiesDto()
            {
                ApiScopeId = id,
                Key = key
            });

            return Ok(exists);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiScopeApiDto>> GetScope(int id)
        {
            var apiScopesDto = await _apiScopeService.GetApiScopeAsync(id);
            var apiScopeApiDto = apiScopesDto.ToApiScopeApiDto();

            return Ok(apiScopeApiDto);
        }

        [HttpGet("{id}/Properties")]
        public async Task<ActionResult<ApiScopePropertiesApiDto>> GetScopeProperties(int id, int page = 1, int pageSize = 10)
        {
            var apiScopePropertiesDto = await _apiScopeService.GetApiScopePropertiesAsync(id, page, pageSize);
            var apiScopePropertiesApiDto = apiScopePropertiesDto.ToApiScopePropertiesApiDto();

            return Ok(apiScopePropertiesApiDto);
        }

        [HttpGet("{id}/Clients")]
        public async Task<ActionResult<ClientsApiDto>> GetScopeClients(int id, int page = 1, int pageSize = 10)
        {
            var apiScopeDto = await _apiScopeService.GetApiScopeAsync(id);
            var clientsDto = await _clientService.GetClientsByScopeAsync(apiScopeDto.Name, page, pageSize);
            var clientsApiDto = clientsDto.ToClientsApiDto();

            return Ok(clientsApiDto);
        }

        [HttpGet("{id}/ApiResources")]
        public async Task<ActionResult<ApiResourcesApiDto>> GetScopeApiResources(int id, int page = 1, int pageSize = 10)
        {
            var apiScopeDto = await _apiScopeService.GetApiScopeAsync(id);
            var apiResourcesDto = await _apiResourceService.GetApiResourcesByScopeAsync(apiScopeDto.Name, page, pageSize);
            var apiResourcesApiDto = apiResourcesDto.ToApiResourcesApiDto();

            return Ok(apiResourcesApiDto);
        }

        [HttpPost]
        [ProducesResponseType(typeof(ApiScopeApiDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<ApiScopeApiDto>> PostScope([FromBody] ApiScopeApiDto apiScopeApi)
        {
            var apiScope = apiScopeApi.ToApiScopeDto();

            if (!apiScope.Id.Equals(default))
            {
                return BadRequest(_errorResources.CannotSetId());
            }

            var apiScopeId = await _apiScopeService.AddApiScopeAsync(apiScope);
            apiScope.Id = apiScopeId;

            return CreatedAtAction(nameof(GetScope), new { id = apiScopeId }, apiScope);
        }

        [HttpPost("{id}/Properties")]
        [ProducesResponseType(typeof(ApiScopePropertyApiDto), 201)]
        [ProducesResponseType(400)]
        public async Task<ActionResult<ApiScopePropertyApiDto>> PostProperty(int id, [FromBody] ApiScopePropertyApiDto apiScopePropertyApi)
        {
            var apiResourcePropertiesDto = apiScopePropertyApi.ToApiScopePropertiesDto();
            apiResourcePropertiesDto.ApiScopeId = id;

            if (!apiResourcePropertiesDto.ApiScopePropertyId.Equals(default))
            {
                return BadRequest(_errorResources.CannotSetId());
            }

            var propertyId = await _apiScopeService.AddApiScopePropertyAsync(apiResourcePropertiesDto);
            apiScopePropertyApi.Id = propertyId;

            return CreatedAtAction(nameof(GetProperty), new { propertyId }, apiScopePropertyApi);
        }

        [HttpGet("Properties/{propertyId}")]
        public async Task<ActionResult<ApiScopePropertyApiDto>> GetProperty(int propertyId)
        {
            var apiScopePropertyAsync = await _apiScopeService.GetApiScopePropertyAsync(propertyId);
            var resourcePropertyApiDto = apiScopePropertyAsync.ToApiScopePropertyApiDto();

            return Ok(resourcePropertyApiDto);
        }

        [HttpDelete("Properties/{propertyId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteProperty(int propertyId)
        {
            var apiScopePropertiesDto = new ApiScopePropertiesDto { ApiScopePropertyId = propertyId };

            await _apiScopeService.GetApiScopePropertyAsync(apiScopePropertiesDto.ApiScopePropertyId);
            await _apiScopeService.DeleteApiScopePropertyAsync(apiScopePropertiesDto);

            return NoContent();
        }

        [HttpPut]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> PutScope([FromBody] ApiScopeApiDto apiScopeApi)
        {
            var apiScope = apiScopeApi.ToApiScopeDto();

            await _apiScopeService.GetApiScopeAsync(apiScope.Id);

            await _apiScopeService.UpdateApiScopeAsync(apiScope);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteScope(int id)
        {
            var apiScope = new ApiScopeDto { Id = id };

            await _apiScopeService.GetApiScopeAsync(apiScope.Id);

            await _apiScopeService.DeleteApiScopeAsync(apiScope);

            return NoContent();
        }
    }
}