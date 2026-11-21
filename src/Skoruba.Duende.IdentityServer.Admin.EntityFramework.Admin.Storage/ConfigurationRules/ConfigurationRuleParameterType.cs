// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

/// <summary>
/// Value types a rule parameter can take. The Admin UI renders an input per type and the
/// Admin API validates the stored configuration against it.
/// </summary>
public enum ConfigurationRuleParameterType
{
    String,
    Number,
    Boolean,
    Array
}
