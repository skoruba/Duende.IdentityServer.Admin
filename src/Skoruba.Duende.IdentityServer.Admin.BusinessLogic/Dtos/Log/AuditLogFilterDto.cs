// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.Dtos.Log
{
    public class AuditLogFilterDto
    {
        public string Event { get; set; }

        public string Source { get; set; }

        public string Category { get; set; }

        public DateTime? Created { get; set; }

        public string SubjectIdentifier { get; set; }

        public string SubjectName { get; set; }

        public int PageSize { get; set; } = 10;

        public int Page { get; set; } = 1;
    }
}
