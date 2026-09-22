// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.STS.Identity.Configuration
{
    /// <summary>
    /// Configures the globally enforceable cryptographic restrictions of the
    /// FAPI 2.0 Security Profile.
    /// </summary>
    public class Fapi2SecurityProfile
    {
        public bool Enabled { get; set; }
    }
}
