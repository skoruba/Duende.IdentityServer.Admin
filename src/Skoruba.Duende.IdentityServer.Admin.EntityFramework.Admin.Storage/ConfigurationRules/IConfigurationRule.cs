// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;

/// <summary>
/// A configuration rule: its key, what the Admin UI shows for it and the check itself.
/// A rule instance is created for every validation run, so it may keep state of that run.
/// The metadata is read once at startup and has to stay constant.
/// </summary>
public interface IConfigurationRule : IConfigurationRuleMetadata, IConfigurationRuleValidator
{
}
