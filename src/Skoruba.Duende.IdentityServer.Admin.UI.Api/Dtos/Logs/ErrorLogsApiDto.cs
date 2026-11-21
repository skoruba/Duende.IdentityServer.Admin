// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Logs
{
    public class ErrorLogsApiDto
    {
        public List<ErrorLogApiDto> Logs { get; set; } = new();

        public int TotalCount { get; set; }

        public int PageSize { get; set; }
    }
}
