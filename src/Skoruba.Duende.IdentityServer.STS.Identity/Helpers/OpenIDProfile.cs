// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.STS.Identity.Helpers
{
    public class OpenIdProfile
    {
        public string FullName { get; internal set; }
        public string Website { get; internal set; }
        public string Profile { get; internal set; }
        public string StreetAddress { get; internal set; }
        public string Locality { get; internal set; }
        public string Region { get; internal set; }
        public string PostalCode { get; internal set; }
        public string Country { get; internal set; }
    }
}
