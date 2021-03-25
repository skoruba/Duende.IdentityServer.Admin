// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace SkorubaDuende.IdentityServerAdmin.Admin.Api.Configuration.AuditLogging
{
    public class AuditLoggingConfiguration
    {
        public string Source { get; set; }

        public string SubjectIdentifierClaim { get; set; }

        public string SubjectNameClaim { get; set; }

        public string ClientIdClaim { get; set; }
    }
}








