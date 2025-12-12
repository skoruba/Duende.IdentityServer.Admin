# Configuration Rules System - Dokumentace

## Přehled

Systém Configuration Rules umožňuje dynamickou správu validačních pravidel pro IdentityServer konfiguraci. Místo hardcodovaných kontrol v kódu máš flexibilní systém s pravidly uloženými v databázi.

## Architektura

### 1. **Database Layer** (EntityFramework.Shared)

#### ConfigurationRule Entity

```csharp
public class ConfigurationRule
{
    public int Id { get; set; }
    public ConfigurationRuleType RuleType { get; set; }        // Typ pravidla
    public ConfigurationResourceType ResourceType { get; set; } // Client, ApiScope, etc.
    public ConfigurationIssueType IssueType { get; set; }      // Warning, Recommendation, Error
    public bool IsEnabled { get; set; }                         // Aktivní/neaktivní
    public string Configuration { get; set; }                   // JSON konfigurace
    public string MessageTemplate { get; set; }                 // Zpráva pro UI
    public string FixDescription { get; set; }                  // Návod jak opravit
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

**Configuration (JSON):** Obsahuje parametry specifické pro pravidlo

- `{"prefix": "scope_"}` - pro ApiScopeNameMustStartWith
- `{"allowLocalhost": true}` - pro ClientRedirectUrisMustUseHttps
- `{"maxLifetimeSeconds": 3600}` - pro ClientAccessTokenLifetimeTooLong

#### ConfigurationRulesDbContext

Samostatný DbContext v `EntityFramework.Shared/DbContexts/ConfigurationRulesDbContext.cs`

- Obsahuje seed data s 6 předpřipravenými pravidly
- Unikátní index na (RuleType, ResourceType)

### 2. **Rule Engine** (BusinessLogic)

#### Struktura pravidel

```
BusinessLogic/
  Rules/
    IConfigurationRuleValidator.cs          # Rozhraní pro všechna pravidla
    ConfigurationRuleValidatorBase.cs       # Base třída s helper metodami
    ClientRules/
      ObsoleteImplicitGrantRule.cs
      ObsoletePasswordGrantRule.cs
      MissingPkceRule.cs
      ClientRedirectUrisMustUseHttpsRule.cs
      ClientAccessTokenLifetimeTooLongRule.cs
    ApiScopeRules/
      ApiScopeNameMustStartWithRule.cs
      ApiScopeMustHaveDisplayNameRule.cs
```

#### Jak funguje validace pravidla

1. **IConfigurationRuleValidator** - každé pravidlo implementuje:

```csharp
Task<List<ConfigurationIssueView>> ValidateAsync(string configuration)
```

2. **Pravidlo s parametry** - příklad:

```csharp
public class ApiScopeNameMustStartWithRule<TDbContext> : ConfigurationRuleValidatorBase
{
    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration)
    {
        // Deserializuj JSON konfiguraci
        var config = DeserializeConfiguration<PrefixConfig>(configuration);

        if (string.IsNullOrWhiteSpace(config.Prefix))
            return new List<ConfigurationIssueView>();

        // Najdi všechny API Scopes, které neodpovídají pravidlu
        return await _dbContext.ApiScopes
            .Where(s => !s.Name.StartsWith(config.Prefix))
            .Select(s => new ConfigurationIssueView
            {
                ResourceId = s.Id,
                ResourceName = s.Name,
                Message = ConfigurationIssueMessageEnum.ApiScopeNameMustStartWith,
                IssueType = ConfigurationIssueTypeView.Recommendation,
                ResourceType = ConfigurationResourceType.ApiScope
            })
            .ToListAsync();
    }

    private class PrefixConfig
    {
        public string Prefix { get; set; }
    }
}
```

3. **ConfigurationRuleValidatorFactory** - vytváří instance pravidel:

```csharp
public IConfigurationRuleValidator Create(ConfigurationRuleType ruleType)
{
    return ruleType switch
    {
        ConfigurationRuleType.ObsoleteImplicitGrant => new ObsoleteImplicitGrantRule<TDbContext>(_dbContext),
        ConfigurationRuleType.ApiScopeNameMustStartWith => new ApiScopeNameMustStartWithRule<TDbContext>(_dbContext),
        // ...
    };
}
```

### 3. **Repository & Service Layer**

#### ConfigurationIssuesRepository

```csharp
public async Task<List<ConfigurationIssueView>> GetAllIssuesAsync()
{
    var issues = new List<ConfigurationIssueView>();

    // 1. Načti všechna aktivní pravidla z DB
    var enabledRules = await rulesDbContext.ConfigurationRules
        .Where(r => r.IsEnabled)
        .ToListAsync();

    // 2. Pro každé pravidlo spusť validaci
    foreach (var rule in enabledRules)
    {
        var validator = ruleValidatorFactory.Create(rule.RuleType);
        var ruleIssues = await validator.ValidateAsync(rule.Configuration);

        // 3. Přidej FixDescription z pravidla do každého issue
        foreach (var issue in ruleIssues)
        {
            issue.FixDescription = rule.FixDescription;
        }

        issues.AddRange(ruleIssues);
    }

    return issues;
}
```

### 4. **API Layer**

#### Dva controllery:

**ConfigurationIssuesController** - zobrazení problémů (existující)

- `GET /api/ConfigurationIssues` - seznam všech issues
- `GET /api/ConfigurationIssues/GetSummary` - počet warnings/recommendations

**ConfigurationRulesController** - správa pravidel (nový)

- `GET /api/ConfigurationRules` - seznam všech pravidel
- `GET /api/ConfigurationRules/{id}` - detail pravidla
- `POST /api/ConfigurationRules` - vytvoření nového pravidla
- `PUT /api/ConfigurationRules/{id}` - aktualizace pravidla
- `DELETE /api/ConfigurationRules/{id}` - smazání pravidla
- `PATCH /api/ConfigurationRules/{id}/toggle` - zapnout/vypnout pravidlo

## Jak přidat nové pravidlo

### 1. Přidat enum hodnotu

```csharp
// EntityFramework.Shared/Entities/ConfigurationRuleType.cs
public enum ConfigurationRuleType
{
    // ... existující
    ClientMustHaveClientSecret  // Nová hodnota
}

// EntityFramework/Entities/ConfigurationIssueMessageEnum.cs
public enum ConfigurationIssueMessageEnum
{
    // ... existující
    ClientMustHaveClientSecret
}
```

### 2. Vytvořit implementaci pravidla

```csharp
// BusinessLogic/Rules/ClientRules/ClientMustHaveClientSecretRule.cs
public class ClientMustHaveClientSecretRule<TDbContext> : ConfigurationRuleValidatorBase, IConfigurationRuleValidator
    where TDbContext : DbContext, IAdminConfigurationDbContext
{
    private readonly TDbContext _dbContext;

    public ClientMustHaveClientSecretRule(TDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ConfigurationIssueView>> ValidateAsync(string configuration)
    {
        return await _dbContext.Clients
            .Where(c => c.RequireClientSecret &&
                       !c.ClientSecrets.Any())
            .Select(c => new ConfigurationIssueView
            {
                ResourceId = c.Id,
                ResourceName = c.ClientName,
                Message = ConfigurationIssueMessageEnum.ClientMustHaveClientSecret,
                IssueType = ConfigurationIssueTypeView.Warning,
                ResourceType = ConfigurationResourceType.Client
            })
            .ToListAsync();
    }
}
```

### 3. Přidat do Factory

```csharp
// BusinessLogic/Rules/ConfigurationRuleValidatorFactory.cs
public IConfigurationRuleValidator Create(ConfigurationRuleType ruleType)
{
    return ruleType switch
    {
        // ... existující
        ConfigurationRuleType.ClientMustHaveClientSecret =>
            new ClientMustHaveClientSecretRule<TDbContext>(_dbContext),
        _ => throw new NotSupportedException($"Rule type {ruleType} is not implemented")
    };
}
```

### 4. Přidat seed data (volitelné)

```csharp
// EntityFramework.Shared/DbContexts/ConfigurationRulesDbContext.cs
new ConfigurationRule
{
    Id = 7,
    RuleType = ConfigurationRuleType.ClientMustHaveClientSecret,
    ResourceType = ConfigurationResourceType.Client,
    IssueType = ConfigurationIssueType.Warning,
    IsEnabled = false,
    Configuration = null,
    MessageTemplate = "Client requires secret but has none configured",
    FixDescription = "Go to client details → Secrets and add at least one client secret.",
    CreatedAt = now
}
```

## Použití z UI

### Zobrazení issues (existující)

```typescript
// GET /api/ConfigurationIssues
{
  "resourceId": 123,
  "resourceName": "client_3694c893a099bd7a9b506bb41c827b86",
  "message": "ObsoleteImplicitGrant",
  "issueType": "Warning",
  "resourceType": "Client",
  "fixDescription": "Go to the client details → Advanced → Grant Types and replace 'implicit' with 'authorization_code'."
}
```

### Správa pravidel (nový)

```typescript
// GET /api/ConfigurationRules
{
  "rules": [
    {
      "id": 1,
      "ruleType": "ObsoleteImplicitGrant",
      "resourceType": "Client",
      "issueType": "Warning",
      "isEnabled": true,
      "configuration": null,
      "messageTemplate": "Client uses obsolete implicit grant flow",
      "fixDescription": "Go to the client details → Advanced...",
      "createdAt": "2025-12-12T10:00:00Z"
    }
  ],
  "totalCount": 6
}

// PATCH /api/ConfigurationRules/5/toggle
// Zapne/vypne pravidlo
```

## Co je třeba udělat pro integraci

### 1. Dependency Injection

V Startup/Program.cs přidej:

```csharp
services.AddDbContext<ConfigurationRulesDbContext>(options =>
    options.UseSqlServer(connectionString));

services.AddScoped<IConfigurationRulesRepository, ConfigurationRulesRepository>();
services.AddScoped<IConfigurationRulesService, ConfigurationRulesService>();
services.AddScoped<IConfigurationRuleValidatorFactory, ConfigurationRuleValidatorFactory<YourDbContext>>();
```

### 2. Migrace databáze

```bash
dotnet ef migrations add AddConfigurationRules --context ConfigurationRulesDbContext
dotnet ef database update --context ConfigurationRulesDbContext
```

### 3. Frontend - seznam pravidel

Vytvoř stránku pro správu pravidel s:

- Tabulka se všemi pravidly
- Toggle switch pro IsEnabled
- Edit dialog s poli:
  - MessageTemplate (text)
  - FixDescription (textarea)
  - Configuration (JSON editor)
  - IssueType (dropdown: Warning/Recommendation/Error)

### 4. Frontend - zobrazení Fix popisu

V seznamu issues přidej sloupec/tooltip s `fixDescription`

## Výhody tohoto řešení

✅ **Flexibilita** - pravidla se dají zapínat/vypínat bez deploye
✅ **Konfigurovatelnost** - parametry pravidel v JSON
✅ **Rozšiřitelnost** - snadné přidání nových pravidel
✅ **Oddělení** - business logika v C#, konfigurace v DB
✅ **Type-safe** - enums pro typy pravidel
✅ **Uživatelsky přívětivé** - FixDescription přímo v UI
✅ **Testovatelnost** - každé pravidlo samostatně testovatelné

## Příklady JSON konfigurace

```json
// ApiScopeNameMustStartWith
{
  "prefix": "api."
}

// ClientRedirectUrisMustUseHttps
{
  "allowLocalhost": true
}

// ClientAccessTokenLifetimeTooLong
{
  "maxLifetimeSeconds": 3600
}

// Budoucí příklad - ClientAllowedScopesMustInclude
{
  "requiredScopes": ["openid", "profile"]
}
```
