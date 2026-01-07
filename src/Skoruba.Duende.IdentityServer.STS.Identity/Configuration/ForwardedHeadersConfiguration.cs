// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System.Collections.Generic;

namespace Skoruba.Duende.IdentityServer.STS.Identity.Configuration
{
    public class ForwardedHeadersConfiguration
    {
        /// <summary>
        /// Enable forwarded headers middleware. Default: true
        /// Set to false if running Kestrel directly without a reverse proxy
        /// </summary>
        public bool Enabled { get; set; } = true;

        /// <summary>
        /// List of known proxy IP addresses or CIDR ranges (e.g., "10.0.0.1", "192.168.1.0/24")
        /// Leave empty for development. For production, specify your proxy/load balancer IPs
        /// </summary>
        public List<string> KnownProxies { get; set; } = new List<string>();

        /// <summary>
        /// List of known network CIDR ranges (e.g., "10.0.0.0/8", "172.16.0.0/12")
        /// Leave empty for development. For production, specify your internal network ranges
        /// </summary>
        public List<string> KnownNetworks { get; set; } = new List<string>();

        /// <summary>
        /// Forward limit - number of proxies to trust. Default: 1
        /// Set to null for unlimited (not recommended for production)
        /// </summary>
        public int? ForwardLimit { get; set; } = 1;

        /// <summary>
        /// Allow all proxies and networks (insecure, only for development)
        /// When true, clears KnownProxies and KnownNetworks allowing all sources
        /// </summary>
        public bool AllowAll { get; set; } = false;
    }
}
