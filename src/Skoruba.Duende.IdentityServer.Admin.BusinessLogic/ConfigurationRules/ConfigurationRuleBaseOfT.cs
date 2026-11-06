// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using System.Collections.Generic;
using System.Linq;
using Duende.IdentityServer.EntityFramework.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.ConfigurationRules;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.BusinessLogic.ConfigurationRules;

/// <summary>
/// A rule whose JSON configuration binds to <typeparamref name="TConfiguration"/>. Implement
/// <see cref="Validate"/> and report with one of the <c>Issue</c> overloads, which fill in the
/// message, the fix description and the severity the administrator configured for the rule.
/// </summary>
/// <typeparam name="TConfiguration">
/// Class with a property per <see cref="ConfigurationRuleBase.Parameters">parameter</see>, matched
/// case-insensitively. A missing parameter leaves the property at its default; use a nullable
/// property and fall back to the parameter's default value in <see cref="Validate"/>.
/// </typeparam>
public abstract class ConfigurationRuleBase<TConfiguration> : ConfigurationRuleBase where TConfiguration : new()
{
    private Run _run;

    public sealed override List<ConfigurationIssueView> ValidateWithContext(ValidationContext context, string configuration,
        string messageTemplate, string fixDescriptionTemplate, ConfigurationIssueTypeView issueType)
    {
        var previous = _run;
        _run = new Run(messageTemplate, fixDescriptionTemplate, issueType);
        try
        {
            return Validate(context, DeserializeConfiguration<TConfiguration>(configuration)).ToList();
        }
        finally
        {
            _run = previous;
        }
    }

    /// <summary>
    /// The check. Return one <see cref="ConfigurationIssueView"/> per finding, built with an
    /// <c>Issue</c> overload; return nothing when the configuration is fine.
    /// </summary>
    protected abstract IEnumerable<ConfigurationIssueView> Validate(ValidationContext context, TConfiguration configuration);

    protected ConfigurationIssueView Issue(Client client, Dictionary<string, string> parameters, ConfigurationIssueTypeView? issueType = null)
    {
        return Issue(client.Id, GetDisplayName(client.ClientName, client.ClientId), parameters, issueType);
    }

    protected ConfigurationIssueView Issue(ApiScope apiScope, Dictionary<string, string> parameters, ConfigurationIssueTypeView? issueType = null)
    {
        return Issue(apiScope.Id, GetDisplayName(apiScope.DisplayName, apiScope.Name), parameters, issueType);
    }

    protected ConfigurationIssueView Issue(ApiResource apiResource, Dictionary<string, string> parameters, ConfigurationIssueTypeView? issueType = null)
    {
        return Issue(apiResource.Id, GetDisplayName(apiResource.DisplayName, apiResource.Name), parameters, issueType);
    }

    protected ConfigurationIssueView Issue(IdentityResource identityResource, Dictionary<string, string> parameters, ConfigurationIssueTypeView? issueType = null)
    {
        return Issue(identityResource.Id, GetDisplayName(identityResource.DisplayName, identityResource.Name), parameters, issueType);
    }

    /// <summary>
    /// An issue on the resource with the given Id and name. The parameters fill the
    /// placeholders of the message and fix templates, e.g. <c>{clientName}</c>.
    /// </summary>
    protected ConfigurationIssueView Issue(int resourceId, string resourceName, Dictionary<string, string> parameters, ConfigurationIssueTypeView? issueType = null)
    {
        var run = _run ?? throw new InvalidOperationException($"{nameof(Issue)} can only be called from {nameof(Validate)}.");
        parameters ??= new Dictionary<string, string>();

        return new ConfigurationIssueView
        {
            ResourceId = resourceId,
            ResourceName = resourceName,
            ResourceType = ResourceType,
            Message = FormatMessage(run.MessageTemplate, parameters),
            FixDescription = FormatMessage(run.FixDescriptionTemplate, parameters),
            IssueType = issueType ?? run.IssueType,
            MessageParameters = parameters
        };
    }

    private sealed record Run(string MessageTemplate, string FixDescriptionTemplate, ConfigurationIssueTypeView IssueType);
}
