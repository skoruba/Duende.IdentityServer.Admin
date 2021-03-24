// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Shared.Configuration.Configuration.Email
{
    public class SendGridConfiguration
    {
        public string ApiKey { get; set; }
        public string SourceEmail { get; set; }
        public string SourceName { get; set; }
        public bool EnableClickTracking { get; set; } = false;
    }
}