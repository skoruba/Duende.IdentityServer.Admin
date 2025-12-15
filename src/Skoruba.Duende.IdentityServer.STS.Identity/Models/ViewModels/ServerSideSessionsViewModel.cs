using System;
using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Models.ViewModels;

public class ServerSideSessionsViewModel
{
    public IList<SessionItem> Sessions { get; set; } = new List<SessionItem>();
    public string Filter { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }

    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}

public class SessionItem
{
    public string SubjectId { get; set; }
    public string SessionId { get; set; }
    public string DisplayName { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Expires { get; set; }
    public string Data { get; set; }
}
