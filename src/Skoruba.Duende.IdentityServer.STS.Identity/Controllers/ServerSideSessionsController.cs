#nullable enable

using System.Linq;
using System.Threading.Tasks;
using Duende.IdentityServer;
using Duende.IdentityServer.EntityFramework.Entities;
using Duende.IdentityServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;
using Skoruba.Duende.IdentityServer.STS.Identity.Configuration.Constants;
using Skoruba.Duende.IdentityServer.STS.Identity.Models.ViewModels;
using Skoruba.Duende.IdentityServer.STS.Identity.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Controllers;

[Authorize(Policy = AuthorizationConsts.AdministrationPolicy)]
public class ServerSideSessionsController : Controller
{
    private readonly IdentityServerPersistedGrantDbContext _persistedGrantDbContext;
    private readonly ServerSideSessionsConfiguration _serverSideSessionsConfig;
    private readonly ILogger<ServerSideSessionsController> _logger;

    public ServerSideSessionsController(
        IdentityServerPersistedGrantDbContext persistedGrantDbContext,
        IOptions<ServerSideSessionsConfiguration> serverSideSessionsOptions,
        ILogger<ServerSideSessionsController> logger)
    {
        _persistedGrantDbContext = persistedGrantDbContext;
        _serverSideSessionsConfig = serverSideSessionsOptions.Value;
        _logger = logger;
    }

    private bool IsServerSideSessionsEnabled()
    {
        return _serverSideSessionsConfig.Enabled;
    }

    public async Task<IActionResult> Index(string filter, int page = 1, int pageSize = 20)
    {
        if (!IsServerSideSessionsEnabled())
        {
            _logger.LogWarning("Server-side sessions feature is disabled. Enable it in configuration: {SectionName}:Enabled = true",
                ServerSideSessionsConfiguration.SectionName);
            return NotFound();
        }

        if (page < 1) page = 1;

        var query = _persistedGrantDbContext.Set<ServerSideSession>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(filter))
        {
            query = query.Where(s =>
                s.SubjectId.Contains(filter) ||
                s.SessionId.Contains(filter) ||
                s.DisplayName.Contains(filter));
        }

        var total = await query.CountAsync();
        var sessions = await query
            .OrderByDescending(s => s.Created)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SessionItem
            {
                SubjectId = s.SubjectId,
                SessionId = s.SessionId,
                DisplayName = s.DisplayName,
                Created = s.Created,
                Expires = s.Expires,
                Data = s.Data
            })
            .ToListAsync();

        return View(new ServerSideSessionsViewModel
        {
            Sessions = sessions,
            Filter = filter,
            Page = page,
            PageSize = pageSize,
            TotalCount = total
        });
    }

    [HttpPost]
    public async Task<IActionResult> Delete(string sessionId, string filter, int page = 1, int pageSize = 20)
    {
        if (!IsServerSideSessionsEnabled())
        {
            _logger.LogWarning("Attempted to delete server-side session {SessionId} but feature is disabled. Enable it in configuration: {SectionName}:Enabled = true",
                sessionId, ServerSideSessionsConfiguration.SectionName);
            return NotFound();
        }

        var session = await _persistedGrantDbContext.Set<ServerSideSession>()
            .FirstOrDefaultAsync(s => s.SessionId == sessionId);

        if (session != null)
        {
            _persistedGrantDbContext.Set<ServerSideSession>().Remove(session);
            await _persistedGrantDbContext.SaveChangesAsync();
        }

        return RedirectToAction(nameof(Index), new { filter, page, pageSize });
    }
}
