// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log
{
    public class AuditLogsDto
    {
        public AuditLogsDto()
        {
            Logs = new List<AuditLogDto>();
        }

        [Required]
        public DateTime? DeleteOlderThan { get; set; }

        public List<AuditLogDto> Logs { get; set; }

        public int TotalCount { get; set; }

        public int PageSize { get; set; }
    }
}
