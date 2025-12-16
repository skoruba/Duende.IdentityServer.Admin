// Copyright (c) Jan Škoruba. All Rights Reserved.
// Licensed under the Apache License, Version 2.0.

using System;
using Microsoft.EntityFrameworkCore;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Interfaces;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Entities;
using Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Helpers;

namespace SkorubaDuende.IdentityServerAdmin.Admin.EntityFramework.Shared.DbContexts;

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
        // Use ConfigurationRuleSeedHelper for consistent seed data across all providers
        var configurationRules = Skoruba.Duende.IdentityServer.Admin.EntityFramework.Admin.Storage.Helpers.ConfigurationRuleSeedHelper.GetSeedData();

        modelBuilder.Entity<ConfigurationRule>().HasData(configurationRules);
    }
}
