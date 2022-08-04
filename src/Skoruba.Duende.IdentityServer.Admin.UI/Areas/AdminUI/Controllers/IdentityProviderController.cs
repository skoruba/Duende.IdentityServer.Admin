// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.IdentityProvider;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Helpers;
using Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Services.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.UI.Configuration.Constants;
using Skoruba.Duende.IdentityServer.Admin.UI.ExceptionHandling;
using Skoruba.Duende.IdentityServer.Admin.UI.Helpers;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Areas.AdminUI.Controllers
{
    [Authorize(Policy = AuthorizationConsts.AdministrationPolicy)]
    [TypeFilter(typeof(ControllerExceptionFilterAttribute))]
    [Area(CommonConsts.AdminUIArea)]
    public class IdentityProviderController : BaseController
    {
        private readonly IIdentityProviderService _identityProviderService;
        private readonly IStringLocalizer<IdentityProviderController> _localizer;

        public IdentityProviderController(IIdentityProviderService identityProviderService,
            IStringLocalizer<IdentityProviderController> localizer,
            ILogger<IdentityProviderController> logger)
            : base(logger)
        {
            _identityProviderService = identityProviderService;
            _localizer = localizer;
        }

        [HttpGet]
        public async Task<IActionResult> IdentityProviderDelete(int id)
        {
            if (id == 0) return NotFound();

            var identityProvider = await _identityProviderService.GetIdentityProviderAsync(id);

            return View(identityProvider);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> IdentityProviderDelete(IdentityProviderDto identityProvider)
        {
            await _identityProviderService.DeleteIdentityProviderAsync(identityProvider);
            SuccessNotification(_localizer["SuccessDeleteIdentityProvider"], _localizer["SuccessTitle"]);

            return RedirectToAction(nameof(IdentityProviders));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> IdentityProvider(IdentityProviderDto identityProvider)
        {
            var duplicatesKeys = identityProvider.Properties.GroupBy(s => s.Value.Name).Where(g => g.Count() > 1).ToArray();
            if (duplicatesKeys.Length > 0)
            {
                foreach (var dupGroup in duplicatesKeys)
                {
                    foreach (var d in dupGroup)
                    {
                        ModelState.AddModelError($"{nameof(IdentityProviderDto.Properties)}[{d.Key}].{nameof(IdentityProviderPropertyDto.Name)}", $"duplicate name ({d.Value.Name})");
                    }
                }
                return View(identityProvider);
            }

            if (!ModelState.IsValid)
            {
                return View(identityProvider);
            }
            int identityResourceId;

            if (identityProvider.Id == 0)
            {
                identityResourceId = await _identityProviderService.AddIdentityProviderAsync(identityProvider);
            }
            else
            {
                identityResourceId = identityProvider.Id;
                await _identityProviderService.UpdateIdentityProviderAsync(identityProvider);
            }

            SuccessNotification(string.Format(_localizer["SuccessAddIdentityProvider"], identityProvider.Scheme), _localizer["SuccessTitle"]);

            return RedirectToAction(nameof(IdentityProvider), new { Id = identityResourceId });
        }

        [HttpGet]
        public async Task<IActionResult> IdentityProviders(int? page, string search)
        {
            ViewBag.Search = search;
            var identityResourcesDto = await _identityProviderService.GetIdentityProvidersAsync(search, page ?? 1);

            return View(identityResourcesDto);
        }
        [HttpGet]
        public async Task<IActionResult> IdentityProvider(string id)
        {
            if (id.IsNotPresentedValidNumber())
            {
                return NotFound();
            }

            if (id == default)
            {
                var identityProviderDto = new IdentityProviderDto();

                return View(identityProviderDto);
            }

            int.TryParse(id, out var identityProviderId);
            var identityProvider = await _identityProviderService.GetIdentityProviderAsync(identityProviderId);

            return View(identityProvider);
        }

    }
}