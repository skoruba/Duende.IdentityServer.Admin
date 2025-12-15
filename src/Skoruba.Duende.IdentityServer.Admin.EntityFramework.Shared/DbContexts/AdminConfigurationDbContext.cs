// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;

namespace Skoruba.Duende.IdentityServer.Admin.EntityFramework.Shared.DbContexts;

public class AdminConfigurationDbContext : DbContext, IAdminConfigurationStoreDbContext
{
    public DbSet<ConfigurationRule> ConfigurationRules { get; set; }

    public AdminConfigurationDbContext(DbContextOptions<AdminConfigurationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureConfigurationRules(modelBuilder);
        SeedDefaultRules(modelBuilder);
    }

    private void ConfigureConfigurationRules(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ConfigurationRule>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RuleType).IsRequired();
            entity.Property(e => e.ResourceType).IsRequired();
            entity.Property(e => e.IssueType).IsRequired();
            entity.Property(e => e.IsEnabled).IsRequired();
            entity.Property(e => e.Configuration).HasMaxLength(2000);
            entity.Property(e => e.MessageTemplate).HasMaxLength(500);
            entity.Property(e => e.FixDescription).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasIndex(e => e.RuleType).IsUnique();
        });
    }

    private void SeedDefaultRules(ModelBuilder modelBuilder)
    {
        var createdAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<ConfigurationRule>().HasData(
            new ConfigurationRule
            {
                Id = 1,
                RuleType = ConfigurationRuleType.ObsoleteImplicitGrant,
                ResourceType = ConfigurationResourceType.Client,
                IssueType = ConfigurationIssueType.Warning,
                IsEnabled = true,
                Configuration = null,
                MessageTemplate = "Client uses obsolete implicit grant flow",
                FixDescription = "Go to the client details → Advanced → Grant Types and replace 'implicit' with 'authorization_code'.",
                CreatedAt = createdAt
            },
            new ConfigurationRule
            {
                Id = 2,
                RuleType = ConfigurationRuleType.ObsoletePasswordGrant,
                ResourceType = ConfigurationResourceType.Client,
                IssueType = ConfigurationIssueType.Warning,
                IsEnabled = true,
                Configuration = null,
                MessageTemplate = "Client uses obsolete password grant flow",
                FixDescription = "Go to the client details → Advanced → Grant Types and replace 'password' with 'authorization_code' or 'client_credentials'.",
                CreatedAt = createdAt
            },
            new ConfigurationRule
            {
                Id = 3,
                RuleType = ConfigurationRuleType.MissingPkce,
                ResourceType = ConfigurationResourceType.Client,
                IssueType = ConfigurationIssueType.Recommendation,
                IsEnabled = true,
                Configuration = null,
                MessageTemplate = "Client uses authorization code flow without PKCE",
                FixDescription = "This client does not use PKCE. Consider enabling PKCE for enhanced security.",
                CreatedAt = createdAt
            },
            new ConfigurationRule
            {
                Id = 4,
                RuleType = ConfigurationRuleType.ClientRedirectUrisMustUseHttps,
                ResourceType = ConfigurationResourceType.Client,
                IssueType = ConfigurationIssueType.Warning,
                IsEnabled = false,
                Configuration = "{\"allowLocalhost\": true}",
                MessageTemplate = "Client has {count} non-HTTPS redirect URI(s): {uris}",
                FixDescription = "Update redirect URIs to use HTTPS protocol. For production environments, HTTP is not secure.",
                CreatedAt = createdAt
            },
            new ConfigurationRule
            {
                Id = 5,
                RuleType = ConfigurationRuleType.ApiScopeNameMustStartWith,
                ResourceType = ConfigurationResourceType.ApiScope,
                IssueType = ConfigurationIssueType.Recommendation,
                IsEnabled = false,
                Configuration = "{\"prefixes\": [\"scope_\"]}",
                MessageTemplate = "API Scope '{actualName}' must start with one of: {allowedPrefixes}",
                FixDescription = "Rename the API Scope to follow the naming convention starting with one of the required prefixes.",
                CreatedAt = createdAt
            },
            new ConfigurationRule
            {
                Id = 6,
                RuleType = ConfigurationRuleType.ClientAccessTokenLifetimeTooLong,
                ResourceType = ConfigurationResourceType.Client,
                IssueType = ConfigurationIssueType.Recommendation,
                IsEnabled = false,
                Configuration = "{\"maxLifetimeSeconds\": 3600}",
                MessageTemplate = "Access token lifetime {actualLifetime}s exceeds maximum {maxLifetime}s",
                FixDescription = "Go to client details → Token and reduce the Access Token Lifetime to the recommended maximum value.",
                CreatedAt = createdAt
            },
            new ConfigurationRule
            {
                Id = 7,
                RuleType = ConfigurationRuleType.ClientMustHaveScopes,
                ResourceType = ConfigurationResourceType.Client,
                IssueType = ConfigurationIssueType.Warning,
                IsEnabled = true,
                Configuration = "{\"minScopes\": 1}",
                MessageTemplate = "Client '{clientName}' has {actualCount} allowed scope(s), but requires at least {requiredCount}",
                FixDescription = "Go to client details → Scopes and add allowed scopes.",
                CreatedAt = createdAt
            },
            new ConfigurationRule
            {
                Id = 8,
                RuleType = ConfigurationRuleType.ApiResourceMustHaveScopes,
                ResourceType = ConfigurationResourceType.ApiResource,
                IssueType = ConfigurationIssueType.Warning,
                IsEnabled = true,
                Configuration = "{\"minScopes\": 1}",
                MessageTemplate = "API Resource '{resourceName}' has {actualCount} scope(s), but requires at least {requiredCount}",
                FixDescription = "Go to API Resource details → Scopes and add at least one scope.",
                CreatedAt = createdAt
            }
        );
    }
}
