using System;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Entities;

public class DashboardAuditLogDataView
{
    public int Total { get; set; }

    public DateTime Created { get; set; }
}