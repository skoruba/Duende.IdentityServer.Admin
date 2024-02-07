// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;

namespace Skoruba.Duende.IdentityServer.Admin.Api.Dtos.PersistedGrants
{
    public class PersistedGrantSubjectApiDto
    {
        public long Id { get; set; }
        public string Key { get; set; }
        public string Type { get; set; }
        public string SubjectId { get; set; }
        public string SubjectName { get; set; }
        public string ClientId { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? Expiration { get; set; }
        public string Data { get; set; }
        public DateTime? ConsumedTime { get; set; }
        public string SessionId { get; set; }
        public string Description { get; set; }
    }
}