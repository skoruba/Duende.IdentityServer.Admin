// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;

namespace Skoruba.Duende.IdentityServer.Admin.UI.Api.Dtos.Logs
{
    public class ErrorLogApiDto
    {
        public long Id { get; set; }

        public string Level { get; set; }

        public DateTimeOffset TimeStamp { get; set; }

        public string Message { get; set; }

        public string MessageTemplate { get; set; }

        public string Exception { get; set; }

        public string LogEvent { get; set; }
    }
}
