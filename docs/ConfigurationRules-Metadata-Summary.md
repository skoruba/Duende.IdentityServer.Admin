# Configuration Rules - Metadata System Summary

## Problém

Frontend potřebuje vědět, jakou strukturu JSON má očekávat pro `configuration` pole u každého pravidla.

## Řešení

Vytvořil jsem **Metadata Provider** systém, který poskytuje kompletní schéma pro každý typ pravidla.

---

## Co bylo přidáno

### 1. **DTOs pro metadata**

```
ConfigurationRuleMetadataDto
├── ruleType: string
├── displayName: string
├── description: string
├── resourceType: string
├── parameters: RuleParameter[]
├── defaultConfiguration: string (JSON)
└── exampleConfiguration: string (JSON)

ConfigurationRuleParameterDto
├── name: string
├── displayName: string
├── description: string
├── type: "string" | "number" | "boolean" | "array"
├── required: boolean
├── defaultValue: any
├── minValue: number (optional)
├── maxValue: number (optional)
├── pattern: string (regex, optional)
└── allowedValues: string[] (optional)
```

### 2. **Metadata Provider**

- `IConfigurationRuleMetadataProvider` interface
- `ConfigurationRuleMetadataProvider` implementace
- Obsahuje metadata pro všech 14 typů pravidel

### 3. **Nové API endpointy**

- `GET /api/ConfigurationRules/metadata` - všechna metadata
- `GET /api/ConfigurationRules/metadata/{ruleType}` - metadata pro konkrétní pravidlo

---

## Příklady metadat

### Pravidlo bez parametrů

```json
{
  "ruleType": "ObsoleteImplicitGrant",
  "displayName": "Obsolete Implicit Grant",
  "description": "Detects clients using the obsolete implicit grant flow...",
  "resourceType": "Client",
  "parameters": [],
  "defaultConfiguration": null,
  "exampleConfiguration": null
}
```

### Pravidlo s jednoduchým parametrem

```json
{
  "ruleType": "ClientRedirectUrisMustUseHttps",
  "displayName": "Client Redirect URIs Must Use HTTPS",
  "description": "Ensures all client redirect URIs use HTTPS protocol...",
  "resourceType": "Client",
  "parameters": [
    {
      "name": "allowLocalhost",
      "displayName": "Allow Localhost",
      "description": "Allow HTTP for localhost...",
      "type": "boolean",
      "required": false,
      "defaultValue": true
    }
  ],
  "defaultConfiguration": "{\"allowLocalhost\": true}",
  "exampleConfiguration": "{\"allowLocalhost\": false}"
}
```

### Pravidlo s validačními constraints

```json
{
  "ruleType": "ClientAccessTokenLifetimeTooLong",
  "displayName": "Client Access Token Lifetime Too Long",
  "resourceType": "Client",
  "parameters": [
    {
      "name": "maxLifetimeSeconds",
      "displayName": "Maximum Lifetime (seconds)",
      "description": "Maximum allowed access token lifetime",
      "type": "number",
      "required": true,
      "defaultValue": 3600,
      "minValue": 300,
      "maxValue": 86400
    }
  ],
  "defaultConfiguration": "{\"maxLifetimeSeconds\": 3600}",
  "exampleConfiguration": "{\"maxLifetimeSeconds\": 7200}"
}
```

### Pravidlo se string pattern validací

```json
{
  "ruleType": "ApiScopeNameMustStartWith",
  "displayName": "API Scope Name Must Start With",
  "resourceType": "ApiScope",
  "parameters": [
    {
      "name": "prefix",
      "displayName": "Required Prefix",
      "description": "The prefix that all API scope names must start with",
      "type": "string",
      "required": true,
      "pattern": "^[a-zA-Z0-9._-]+$"
    }
  ],
  "defaultConfiguration": "{\"prefix\": \"scope_\"}",
  "exampleConfiguration": "{\"prefix\": \"api.\"}"
}
```

### Pravidlo s array parametrem

```json
{
  "ruleType": "IdentityResourceMustBeEnabled",
  "displayName": "Identity Resource Must Be Enabled",
  "resourceType": "IdentityResource",
  "parameters": [
    {
      "name": "requiredResources",
      "displayName": "Required Resources",
      "description": "List of identity resource names that must be enabled",
      "type": "array",
      "required": false,
      "defaultValue": ["openid", "profile"]
    }
  ],
  "defaultConfiguration": "{\"requiredResources\": [\"openid\", \"profile\"]}",
  "exampleConfiguration": "{\"requiredResources\": [\"openid\", \"profile\", \"email\"]}"
}
```

---

## Jak frontend použije metadata

### 1. Načtení při startu aplikace

```typescript
const metadata = await fetch("/api/ConfigurationRules/metadata").then((r) =>
  r.json()
);
const metadataMap = new Map(metadata.map((m) => [m.ruleType, m]));
```

### 2. Dynamické vytvoření formuláře

```typescript
function RuleEditForm({ rule }) {
  const meta = metadataMap.get(rule.ruleType);

  return (
    <>
      {meta.parameters.map((param) => (
        <FormField
          key={param.name}
          parameter={param}
          value={configObject[param.name]}
        />
      ))}
    </>
  );
}
```

### 3. Validace na FE

```typescript
function validate(config, metadata) {
  const errors = [];

  metadata.parameters.forEach((param) => {
    if (param.required && !config[param.name]) {
      errors.push(`${param.displayName} is required`);
    }

    if (param.type === "number" && config[param.name]) {
      if (param.minValue && config[param.name] < param.minValue) {
        errors.push(`${param.displayName} must be >= ${param.minValue}`);
      }
    }

    if (param.pattern && config[param.name]) {
      if (!new RegExp(param.pattern).test(config[param.name])) {
        errors.push(`${param.displayName} has invalid format`);
      }
    }
  });

  return errors;
}
```

### 4. Default hodnoty při vytváření

```typescript
function createNewRule(ruleType) {
  const meta = metadataMap.get(ruleType);

  return {
    ruleType,
    resourceType: meta.resourceType,
    configuration: meta.defaultConfiguration,
    messageTemplate: meta.displayName,
    fixDescription: meta.description,
    isEnabled: false,
    issueType: "Recommendation",
  };
}
```

---

## Výhody

✅ **Type-safe UI** - frontend přesně ví, co očekávat
✅ **Dynamické formuláře** - automaticky generované podle metadat
✅ **Validace** - minValue, maxValue, pattern, required
✅ **User experience** - hints, descriptions, examples
✅ **No hardcoding** - UI se přizpůsobí novým pravidlům
✅ **Self-documenting** - API vrací dokumentaci
✅ **Default values** - rychlé vytváření nových pravidel

---

## Integrace do projektu

### Dependency Injection

```csharp
services.AddScoped<IConfigurationRuleMetadataProvider, ConfigurationRuleMetadataProvider>();
```

### Controller constructor

```csharp
public ConfigurationRulesController(
    IConfigurationRulesService configurationRulesService,
    IConfigurationRuleMetadataProvider metadataProvider)
{
    _configurationRulesService = configurationRulesService;
    _metadataProvider = metadataProvider;
}
```

---

## Dokumentace

- **Koncept**: `docs/ConfigurationRulesSystem.md`
- **API Reference**: `docs/ConfigurationRules-API-Reference.md`
- **Frontend Guide**: `docs/ConfigurationRules-Frontend-Integration.md`
- **React Example**: `docs/examples/ConfigurationRulesReactExample.tsx`
