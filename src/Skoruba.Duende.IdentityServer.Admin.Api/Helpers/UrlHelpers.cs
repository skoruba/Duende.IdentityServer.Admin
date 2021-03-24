// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.Api.Helpers
{
    public static class UrlHelpers
    {
        public static string QueryStringSafeHash(string hash)
        {
            hash = hash.Replace('+', '-');
            return hash.Replace('/', '_');
        }

        public static string QueryStringUnSafeHash(string hash)
        {
            hash = hash.Replace('-', '+');
            return hash.Replace('_', '/');
        }
    }
}